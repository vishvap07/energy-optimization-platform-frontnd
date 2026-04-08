import os
import sys
import django

# Setup path and django
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'energy_platform.settings')
django.setup()

from apps.chatbot.models import FAQ

def train_chatbot():
    print("Training AI Assistant (Seeding Knowledge Base)...")
    
    # Clear existing FAQs for a fresh start
    FAQ.objects.all().delete()
    
    knowledge_base = [
        # Energy Usage
        {
            'intent': 'energy_usage',
            'question': "How can I see my energy usage?",
            'answer': "You can view your energy consumption on the **User Dashboard**. For deep dives, visit the **Analytics** page, which shows historical trends, daily averages, and hourly consumption profiles.",
            'keywords': ['energy', 'usage', 'consumption', 'kwh', 'meter', 'reading']
        },
        {
            'intent': 'energy_usage',
            'question': "What is my current load?",
            'answer': "The dashboard displays your live load in **kW**. If you have a smart meter connected, this data updates every minute. High loads are flagged automatically.",
            'keywords': ['load', 'current', 'kw', 'live', 'real-time']
        },
        
        # Forecasting
        {
            'intent': 'forecast',
            'question': "How does the forecasting work?",
            'answer': "We use an **LSTM (Long Short-Term Memory)** neural network. It analyzes your past 6 months of data to predict consumption for the next **14 days**. Accuracy is trackable via the MAPE metric on the Forecast page.",
            'keywords': ['lstm', 'how', 'work', 'method', 'technology', 'forecasting']
        },
        {
            'intent': 'forecast',
            'question': "Is the 14-day forecast accurate?",
            'answer': "Our models typically achieve **92-95% accuracy**. However, accuracy can drop during extreme weather events or sudden shifts in industrial activity. Check the 'Confidence Interval' on the charts.",
            'keywords': ['accurate', 'accuracy', 'reliable', 'trust', 'precision']
        },
        
        # Optimization
        {
            'intent': 'optimization',
            'question': "How can I save money on energy?",
            'answer': "The best ways to save are: \n1. **Peak Shaving**: Reducing activity during high-rate hours.\n2. **Load Shifting**: Moving heavy machinery use to off-peak slots (11 PM - 5 AM).\nCheck the **Optimization** page for a detailed schedule.",
            'keywords': ['save', 'money', 'cost', 'reduction', 'savings', 'bills', 'cheaper']
        },
        {
            'intent': 'optimization',
            'question': "What is Peak Shaving?",
            'answer': "Peak shaving is the process of reducing energy consumption during maximum demand periods to avoid 'Demand Charges' from your utility provider. It can save you up to 20% on monthly costs.",
            'keywords': ['peak shaving', 'shaving', 'definition', 'what is']
        },
        
        # Support/Tickets
        {
            'intent': 'create_ticket',
            'question': "How do I report a problem?",
            'answer': "Go to the **Help Desk** section and click **Create Ticket**. Provide a clear title and description. You can track the status of your ticket and chat with our technicians there.",
            'keywords': ['problem', 'issue', 'report', 'error', 'broken', 'help', 'support', 'complain']
        },
        
        # Navigation/General
        {
            'intent': 'system_help',
            'question': "I forgot my password.",
            'answer': "You can change your password in the **Profile Settings** page. If you are locked out, please contact your system administrator to trigger a reset.",
            'keywords': ['password', 'forgot', 'reset', 'change', 'login', 'access']
        },
        {
            'intent': 'general',
            'question': "Who are you?",
            'answer': "I am the **EnergyAI Virtual Assistant**. I'm here to help you navigate the platform, understand your energy metrics, and provide optimization tips. How can I help you today?",
            'keywords': ['who', 'you', 'bot', 'assistant', 'what', 'help']
        }
    ]

    for item in knowledge_base:
        FAQ.objects.create(**item)
        print(f"✅ Added Knowledge: {item['question']}")

    print("\nTraining complete! 11 Knowledge Nodes successfully indexed.")

if __name__ == "__main__":
    train_chatbot()
