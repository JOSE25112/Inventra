
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario
from app.schemas import UsuarioCrear, UsuarioListado
from app.security import hash_password, require_admin

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"],
    dependencies=[Depends(require_admin)]
)


@router.get("", response_model=list[UsuarioListado])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.scalars(
        select(Usuario).order_by(Usuario.id)
    ).all()


@router.post(
    "",
    response_model=UsuarioListado,
    status_code=201
)
def crear_usuario(
    datos: UsuarioCrear,
    db: Session = Depends(get_db)
):
    email = str(datos.email).strip().lower()

    existente = db.scalar(
        select(Usuario.id).where(Usuario.email == email)
    )

    if existente is not None:
        raise HTTPException(
            status_code=409,
            detail="El correo ya está registrado"
        )

    usuario = Usuario(
        nombre=datos.nombre.strip(),
        email=email,
        password_hash=hash_password(datos.password),
        rol=datos.rol
    )

    db.add(usuario)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo crear el usuario: correo duplicado"
        )

    db.refresh(usuario)
    return usuario
