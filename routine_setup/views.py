from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from groq import Groq
import os
import json
from core.models import UserSetting, Task, Hobby, UserHobby
import re 

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Predefined questions with instructions
QUESTIONS = [
    {
        "id": 1,
        "question": "When do you typically start your day?",
        "instruction": "Return the response as JSON: { \"day_start_time\": \"07:00 AM\" }",
        "clarification": "Can you provide the exact time you start your day (e.g., 7 AM)?"
    },
    {
        "id": 2,
        "question": "What tasks do you typically work on over the week?",
        "instruction": "For each task, return a list of task objects in JSON: [ { \"task_name\": \"Task 1\", \"time_required\": \"2 hours\", \"priority\": \"High\", \"days_associated\": [\"Monday\", \"Wednesday\"] } ]",
        "clarification": "Please provide the tasks with the time required and priority (e.g., Task 1, 2 hours, High priority)."
    },
    {
        "id": 3,
        "question": "What are your hobbies that you want to make time for?",
        "instruction": "Return a list of hobbies in JSON: [ { \"hobby_name\": \"Reading\", \"time_required\": \"1 hour\" } ]",
        "clarification": "Please list your hobbies and the time you'd like to dedicate to each."
    },
    {
        "id": 4,
        "question": "How many hours do you dedicate to each task?",
        "instruction": "For each task, return the updated time in JSON: [ { \"task_name\": \"Task 1\", \"time_allocated\": \"2 hours\" } ]",
        "clarification": "Please specify how many hours you want to allocate to each task."
    }
]

from datetime import datetime

class RoutineSetupView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get("user_id")
        user_response = request.data.get("response")
        current_question_id = request.data.get("question_id")

        # Get the current question and its instruction
        current_question = next((q for q in QUESTIONS if q["id"] == current_question_id), None)
        if not current_question:
            return Response({"error": "Invalid question ID."}, status=status.HTTP_400_BAD_REQUEST)

        # Construct prompt for Groq Llama API
        prompt = f"""
        Question: {current_question['question']}
        User Response: {user_response}

        Instruction: {current_question['instruction']}
        If the user response is not containing what is required, return the clarification for the question so the user can respond better.
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
            json_match = re.search(r"\{.*\}|\[.*\]", response_content, re.DOTALL)
            if not json_match:
                return Response({"clarification": current_question["clarification"]}, status=status.HTTP_400_BAD_REQUEST)

            # Parse the extracted JSON
            structured_data = json.loads(json_match.group(0))

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

            elif current_question_id == 4:  # Task hours
                if isinstance(structured_data, list) and all(["task_name" in task for task in structured_data]):
                    for task_data in structured_data:
                        Task.objects.filter(user_id=user_id, task_name=task_data["task_name"]).update(
                            time_required=task_data["time_allocated"]
                        )
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
