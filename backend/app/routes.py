
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.security import get_current_user, require_admin
from app.models import Usuario
from app.database import get_db
from app.models import Categoria, Producto
from app.schemas import (
    CategoriaCrear,
    CategoriaRespuesta,
    ProductoCrear,
    ProductoActualizar,
    ProductoRespuesta,
)

router = APIRouter(prefix="/api")


# ---------- CATEGORÍAS ----------

@router.post(
    "/categorias",
    response_model=CategoriaRespuesta,
    status_code=201,
    tags=["Categorías"]
)
def crear_categoria(
    datos: CategoriaCrear,
    db: Session = Depends(get_db),
    admin : Usuario = Depends(require_admin)
):
    categoria = Categoria(**datos.model_dump())
    db.add(categoria)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="La categoría ya existe"
        )

    db.refresh(categoria)
    return categoria


@router.get(
    "/categorias",
    response_model=list[CategoriaRespuesta],
    tags=["Categorías"]
)
def listar_categorias(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
                      ):
    return db.scalars(
        select(Categoria).order_by(Categoria.id)
    ).all()

# ---------- PRODUCTOS ----------

@router.post(
    "/productos",
    response_model=ProductoRespuesta,
    status_code=201,
    tags=["Productos"]
)
def crear_producto(
    datos: ProductoCrear,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_admin)
):
    categoria = db.get(Categoria, datos.categoria_id)

    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail="La categoría no existe"
        )

    producto = Producto(**datos.model_dump(),
                        stock=0
                        )
    db.add(producto)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar: verifica el SKU"
        )

    db.refresh(producto)
    return producto


@router.get(
    "/productos",
    response_model=list[ProductoRespuesta],
    tags=["Productos"]
)
def listar_productos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return db.scalars(
        select(Producto).order_by(Producto.id)
    ).all()


@router.get(
    "/productos/{producto_id}",
    response_model=ProductoRespuesta,
    tags=["Productos"]
)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    producto = db.get(Producto, producto_id)

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return producto


@router.put(
    "/productos/{producto_id}",
    response_model=ProductoRespuesta,
    tags=["Productos"]
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoActualizar,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_admin)
):
    producto = db.get(Producto, producto_id)

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    if db.get(Categoria, datos.categoria_id) is None:
        raise HTTPException(
            status_code=404,
            detail="La categoría no existe"
        )

    for campo, valor in datos.model_dump().items():
        setattr(producto, campo, valor)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar: verifica el SKU"
        )

    db.refresh(producto)
    return producto


@router.delete(
    "/productos/{producto_id}",
    status_code=204,
    tags=["Productos"]
)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_admin)
):
    producto = db.get(Producto, producto_id)

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    db.delete(producto)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar: tiene movimientos asociados"
        )

@router.delete(
    "/categorias/{categoria_id}",
    status_code=204,
    tags=["Categorías"]
)
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_admin)
):
    categoria = db.get(Categoria, categoria_id)

    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail="Categoría no encontrada"
        )

    producto_asociado = db.scalar(
        select(Producto.id)
        .where(Producto.categoria_id == categoria_id)
        .limit(1)
    )

    if producto_asociado is not None:
        raise HTTPException(
            status_code=409,
            detail="No puedes eliminar una categoría con productos"
        )

    db.delete(categoria)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="La categoría tiene registros asociados"
        )

