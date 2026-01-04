from app.main import app

# For Vercel serverless
def application(environ, start_response):
    return app(environ, start_response) # pyright: ignore[reportCallIssue]