from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from groq import Groq
import os
import json
from core.models import UserSetting, Task, Hobby, UserHobby
import re 

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import google.generativeai as genai  # Import the Gemini SDK
from google.api_core import exceptions
from django.conf import settings  # Import settings for API key

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Predefined questions with instructions
QUESTIONS = [
    {
        "id": 1,
        "question": "When do you typically start your day?",
        "instruction": "Return the response as JSON: for example { \"day_start_time\": \"07:00 AM\" }",
        "clarification": "Can you provide the exact time you start your day (e.g., 7 AM)?"
    },
    {
        "id": 2,
        "question": "What tasks do you typically work on over the week?",
        "instruction": "For tasks, return a list of task objects in JSON: [ { \"task_name\": \"Task 1\", \"time_required\": \"2 hours\", \"priority\": \"High\", \"days_associated\": [\"Monday\", \"Wednesday\"] } ]",
        "clarification": "Please provide the tasks with the time required and priority (e.g., Task 1, 2 hours, High priority)."
    },
    {
        "id": 3,
        "question": "What are your hobbies that you want to make time for?",
        "instruction": "Return a list of hobbies in JSON: for example [ { \"hobby_name\": \"Reading\", \"time_required\": \"1 hour\" } ]",
        "clarification": "Please list your hobbies and the time you'd like to dedicate to each."
    }
]

from datetime import datetime

class RoutineSetupView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get("user_id")
        user_response = request.data.get("response")
        current_question_id = request.data.get("question_id")

        current_question = next((q for q in QUESTIONS if q["id"] == current_question_id), None)
        if not current_question:
            return Response({"error": "Invalid question ID."}, status=status.HTTP_400_BAD_REQUEST)

        # Construct prompt for Groq Llama API
        prompt = f"""
        Act as a professional in helping people setup their routine, you are given a question that is being asked from a user and the user's response and also an instruction about what information you have to extract from the user's response and send as JSON.
        Assume the user is the dumbest person and user response can be vague, but you have to be mindful and try to extract most information without having to send clarification, however if it is really required then you can send the clarification to user. Note that clarification should also be sent in Json format.
        Also Note that if you are able to send the information required in instruction, you don't send the clarification.
        Question: {current_question['question']}
        User Response: {user_response}
        Identify the information required in the instruction from the user response, you can make assumptions for relevantly obvious things.
        Instruction: {current_question['instruction']}
        First of all try to deduce the information required in instruction, If the information required in the instruction can not be deduced from the user response at all, return the clarification for the question so the user can respond better.
        Clarification: {current_question['clarification']}
        
        """

        try:
            # Call Groq API to get the LLM response
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
            )
            response_content = chat_completion.choices[0].message.content
            print(f"Raw Response from Groq: {response_content}")

            # Extract JSON from response using regex
            json_match = re.search(r"(\{.*\}|\[.*\])", response_content, re.DOTALL)
            if not json_match:
                return Response({"clarification": current_question["clarification"]}, status=status.HTTP_400_BAD_REQUEST)
            
            
            json_string = json_match.group(0)
            # Parse the extracted JSON
            try:
                structured_data = json.loads(json_string)
            except json.JSONDecodeError:
                 return Response({"clarification": current_question["clarification"]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle responses based on the current question ID
            if current_question_id == 1:  # Start of the day
                if "day_start_time" not in structured_data:
                    return Response({"clarification": current_question["clarification"]}, status=status.HTTP_400_BAD_REQUEST)

                # Validate and convert time to 24-hour format
                try:
                    day_start_time = structured_data["day_start_time"]
                    converted_time = datetime.strptime(day_start_time, "%I:%M %p").strftime("%H:%M")
                except ValueError:
                    return Response({"clarification": "Invalid time format. Please provide time in '7:00 AM' or '07:00 AM' format."}, status=status.HTTP_400_BAD_REQUEST)

                # Save the converted time
                UserSetting.objects.update_or_create(
                    user_id=user_id,
                    defaults={"day_start_time": converted_time}
                )

            elif current_question_id == 2:  # Tasks
                if isinstance(structured_data, list) and all(["task_name" in task for task in structured_data]):
                    for task_data in structured_data:
                        Task.objects.create(
                            user_id=user_id,
                            task_name=task_data["task_name"],
                            time_required=task_data["time_required"],
                            days_associated=task_data["days_associated"],
                            priority=task_data["priority"]
                        )
                else:
                    return Response({"clarification": current_question["clarification"]}, status=status.HTTP_400_BAD_REQUEST)

            elif current_question_id == 3:  # Hobbies
                if isinstance(structured_data, list) and all(["hobby_name" in hobby for hobby in structured_data]):
                    for hobby_data in structured_data:
                        hobby, created = Hobby.objects.get_or_create(
                            name=hobby_data["hobby_name"],
                            defaults={"category": "General"}
                        )
                        UserHobby.objects.create(user_id=user_id, hobby=hobby)
                else:
                    return Response({"clarification": current_question["clarification"]}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the next question
            next_question = next((q for q in QUESTIONS if q["id"] > current_question_id), None)
            if next_question:
                return Response({"next_question": next_question}, status=status.HTTP_200_OK)

            # If no more questions, return completion message
            return Response({"message": "Routine setup complete!"}, status=status.HTTP_200_OK)

        except json.JSONDecodeError as e:
            print(f"JSON Parsing Error: {str(e)}")
            return Response({"error": "Failed to parse the structured response. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Unexpected Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Fetch the API KEY from django settings
GOOGLE_API_KEY = getattr(settings, 'GOOGLE_API_KEY', None)

if GOOGLE_API_KEY is None:
    raise Exception("Set GOOGLE_API_KEY in your env")


genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@csrf_exempt # Remove this in production; use proper authentication
def generate_routine(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    # Static Data for Now
    user_tasks = [
    # Fixed Time Tasks
        {
            "task_name": "Morning Run",
            "time_required": "00:45:00",
            "days": ["Monday", "Wednesday", "Friday"],
            "is_fixed_time": True,
            "fixed_time_slot": "06:00:00",
        },
        {
            "task_name": "Work Core Hours",
            "time_required": "06:00:00",  # Increased work time
            "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "is_fixed_time": True,
            "fixed_time_slot": "09:00:00",
        },
        {
            "task_name": "Team Meeting",
            "time_required": "01:30:00",
            "days": ["Tuesday", "Thursday"],
            "is_fixed_time": True,
            "fixed_time_slot": "14:00:00",  # Afternoon meeting
        },
        # Flexible Tasks
        {
            "task_name": "Errands",
            "time_required": "01:30:00",
            "days": ["Saturday", "Sunday"],
            "is_fixed_time": False,
        },
        {
            "task_name": "Grocery Shopping",
            "time_required": "01:00:00",
            "days": ["Saturday"],
            "is_fixed_time": False,
        },
        {
            "task_name": "Work on Project",
            "time_required": "02:00:00",
            "days": ["Monday", "Wednesday"],
            "is_fixed_time": False,
        },
        {
            "task_name": "Learning",
            "time_required": "01:30:00",
            "days": ["Tuesday", "Thursday", "Saturday"],
            "is_fixed_time": False,
        },
        {
            "task_name": "Relaxation Time",
            "time_required": "02:00:00",
            "days": ["Friday", "Sunday"],
            "is_fixed_time": False
        }
    ]

    user_hobbies = [
        {"name": "Guitar Practice", "category": "Music"}, # Added Time required
        {"name": "Yoga Session", "category": "Fitness"}, #Added time required
        {"name": "Reading", "category": "Intellectual"} #Added time required
    ]

    user_settings = {
        "day_start_time": "05:30:00",  # Earlier start time
        "day_end_time": "22:30:00",  # Later end time
        "off_day_toggle": False, # Keep it at False
    }
    
    # Prepare prompt for Gemini API
    prompt = f"""
        Generate a detailed weekly routine, ensuring tasks are scheduled without conflicts, and hobbies are integrated.
        
        Tasks: {json.dumps(user_tasks)}
        Hobbies: {json.dumps(user_hobbies)}
        Settings: {json.dumps(user_settings)}
    """
    
    # Call Gemini API using the SDK
    try:
        response = model.generate_content(prompt)
        if response.text:
            generated_routine = response.text
        else:
            return JsonResponse({"error":"The model returned no text"}, status=500)
        
    except exceptions.GoogleAPIError as e:
         return JsonResponse({"error": f"Gemini API Error: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"routine": generated_routine})