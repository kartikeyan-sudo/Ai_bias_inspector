from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.analysis import router as analysis_router
from app.routes.data import router as data_router
from app.routes.explainability import router as explainability_router
from app.routes.health import router as health_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(data_router)
    app.include_router(analysis_router)
    app.include_router(explainability_router)

    return app


app = create_app()
