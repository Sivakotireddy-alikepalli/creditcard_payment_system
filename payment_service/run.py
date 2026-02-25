from payment_service.main import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run("payment_service.main:app", host="0.0.0.0", port=8001, reload=True)
