from pydantic import BaseModel


class AvailableModel(BaseModel):
    id: str
    name: str
    display_name: str
    path: str
    task: str
    loaded: bool
    downloaded: bool
    source: str


class ModelListResponse(BaseModel):
    models: list[AvailableModel]
    default_model: str | None
