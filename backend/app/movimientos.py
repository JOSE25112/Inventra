
import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Movimiento, Producto, Usuario
from app.schemas import MovimientoCrear, MovimientoRespuesta, MovimientoDetalle
from app.security import get_current_user

router = APIRouter(
    prefix="/api/movimientos",
    tags=["Movimientos"]
)


@router.get(
    "",
    response_model=list[MovimientoRespuesta]
)
def listar_movimientos(db: Session = Depends(get_db)):
    return db.scalars(
        select(Movimiento)
        .order_by(Movimiento.fecha.desc(), Movimiento.id.desc())
        .limit(100)
    ).all()



@router.post(
    "",
    response_model=MovimientoRespuesta,
    status_code=201
)
def registrar_movimiento(
    datos: MovimientoCrear,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        producto = db.scalar(
            select(Producto)
            .where(Producto.id == datos.producto_id)
            .with_for_update()
        )

        if producto is None:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        if datos.tipo == "salida":
            if datos.cantidad > producto.stock:
                raise HTTPException(
                    status_code=409,
                    detail="No hay existencias suficientes"
                )

            producto.stock -= datos.cantidad
        else:
            producto.stock += datos.cantidad

        movimiento = Movimiento(
            producto_id=producto.id,
            usuario_id=usuario.id,
            tipo=datos.tipo,
            cantidad=datos.cantidad
        )

        db.add(movimiento)
        db.flush()

        respuesta = MovimientoRespuesta.model_validate(
            movimiento
        )

        db.commit()
        return respuesta

    except Exception:
        db.rollback()
        raise
@router.get(
    "/auditoria",
    response_model= list[MovimientoDetalle]

)
def auditoria_movimientos(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registros = db.execute(
        select(Movimiento, Producto, Usuario)
        .join(Producto, Movimiento.producto_id == Producto.id)
        .join(Usuario, Movimiento.usuario_id == Usuario.id)
        .order_by(
            Movimiento.fecha.desc(),
            Movimiento.id.desc()
        )
        .limit(100)
    ).all()

    return [
        MovimientoDetalle(
            id=movimiento.id,
            producto_id=producto.id,
            producto_nombre=producto.nombre,
            producto_sku=producto.sku,
            usuario_id=operador.id,
            usuario_nombre=operador.nombre,
            tipo=movimiento.tipo,
            cantidad=movimiento.cantidad,
            fecha=movimiento.fecha,
        )
        for movimiento, producto, operador in registros
    ]
