from typing import List, Dict, Any
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from .tools import CreateTaskTool, CreateHobbyTool, GetUserTasksTool, GetUserHobbiesTool
from .models import Conversation, Message, AgentState
from django.conf import settings
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate

class AgentService:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.conversation = self._get_or_create_conversation()
        self.agent_state = self._get_or_create_agent_state()
        self.tools = [
            CreateTaskTool(),
            CreateHobbyTool(),
            GetUserTasksTool(),
            GetUserHobbiesTool()
        ]
        self.agent = self._create_agent()
        
        # Create a more specific prompt template
        self.prompt = PromptTemplate(
            input_variables=["history", "input"],
            template="""You are a helpful assistant that helps users manage their tasks and hobbies. 
            When a user mentions a task or hobby, you should use the appropriate tool to create it in the system.
            
            For tasks, you need:
            - task_name
            - time_required (in HH:MM:SS format)
            - days_associated (list of days)
            - priority (High/Medium/Low)
            - is_fixed_time (true/false)
            - fixed_time_slot (if is_fixed_time is true)
            
            For hobbies, you need:
            - name
            - category
            
            Current conversation:
            {history}
            
            Human: {input}
            Assistant:"""
        )
        
        self.memory = ConversationBufferMemory()
        self.conversation_chain = ConversationChain(
            llm=self.agent,
            memory=self.memory,
            prompt=self.prompt,
            verbose=True
        )
        
    def _get_or_create_conversation(self) -> Conversation:
        conversation, created = Conversation.objects.get_or_create(
            user_id=self.user_id,
            is_active=True
        )
        return conversation
        
    def _get_or_create_agent_state(self) -> AgentState:
        state, created = AgentState.objects.get_or_create(
            conversation=self.conversation
        )
        return state
        
    def _create_agent(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not configured in settings.py")
        
        return ChatGoogleGenerativeAI(
            model="models/gemini-1.5-pro-latest",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7
        )
        
    def process_message(self, message: str) -> str:
        try:
            # Check if the message is about creating a task or hobby
            if "task" in message.lower():
                try:
                    # Extract task details from the message
                    task_data = {
                        "task_name": "Morning Exercise",  # This should be extracted from the message
                        "time_required": "01:00:00",
                        "days_associated": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        "priority": "High",
                        "is_fixed_time": True,
                        "fixed_time_slot": "07:00:00"
                    }
                    # Use the CreateTaskTool
                    result = self.tools[0]._run(self.user_id, task_data)
                    return result
                except Exception as e:
                    print(f"Error creating task: {str(e)}")
                    return f"I encountered an error while creating your task: {str(e)}"
            elif "hobby" in message.lower():
                try:
                    # Extract hobby details from the message
                    hobby_data = {
                        "name": "Yoga",
                        "category": "Fitness"
                    }
                    # Use the CreateHobbyTool
                    result = self.tools[1]._run(self.user_id, hobby_data)
                    return result
                except Exception as e:
                    print(f"Error creating hobby: {str(e)}")
                    return f"I encountered an error while adding your hobby: {str(e)}"
            else:
                # For other messages, use the conversation chain
                try:
                    response = self.conversation_chain.predict(input=message)
                    return response
                except Exception as e:
                    print(f"Error in conversation chain: {str(e)}")
                    return "I apologize, but I encountered an error while processing your message. Please try again."
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            return "I apologize, but I encountered an error while processing your message. Please try again." 