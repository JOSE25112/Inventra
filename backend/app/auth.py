
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario
from app.schemas import (
    LoginRequest,
    TokenRespuesta,
    UsuarioRespuesta,
)
from app.security import (
    crear_token,
    get_current_user,
    verify_password,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)


@router.post(
    "/login",
    response_model=TokenRespuesta
)
def login(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.email == str(datos.email)
        )
    )

    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    try:
        valido = verify_password(
            datos.password,
            usuario.password_hash
        )
    except Exception:
        valido = False

    if not valido:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    return TokenRespuesta(
        access_token=crear_token(usuario)
    )


@router.get(
    "/me",
    response_model=UsuarioRespuesta
)
def mi_perfil(
    usuario: Usuario = Depends(get_current_user)
):
    return usuario
