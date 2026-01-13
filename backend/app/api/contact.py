from dotenv import load_dotenv
import os
from fastapi import FastAPI, HTTPException, APIRouter
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..schemas import ContactForm

load_dotenv()
MY_EMAIL = os.getenv("MY_EMAIL", "")
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")

router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("/", status_code=200)
async def send_contact_email(form: ContactForm):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = MY_EMAIL
        msg['Subject'] = f"New Contact Form Submission from {form.name}"

        body = f"Name: {form.name}\nEmail: {form.email}\n\nMessage:\n{form.message}"
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)

        return {"message": "Your message has been sent successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send email.")