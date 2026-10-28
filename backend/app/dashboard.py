
from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Producto, Usuario
from app.security import get_current_user

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


class DashboardStats(BaseModel):
    total_productos: int
    unidades_disponibles: int
    productos_stock_bajo: int
    productos_agotados: int
    valor_venta_estimado: Decimal


@router.get(
    "/stats",
    response_model=DashboardStats
)
def obtener_estadisticas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    resultado = db.execute(
        select(
            func.count(Producto.id),
            func.coalesce(func.sum(Producto.stock), 0),
            func.coalesce(
                func.sum(
                    case(
                        (
                            (Producto.stock > 0) &
                            (Producto.stock <= Producto.stock_minimo),
                            1
                        ),
                        else_=0
                    )
                ),
                0
            ),
            func.coalesce(
                func.sum(
                    case(
                        (Producto.stock == 0, 1),
                        else_=0
                    )
                ),
                0
            ),
            func.coalesce(
                func.sum(Producto.precio * Producto.stock),
                0
            )
        )
    ).one()

    return DashboardStats(
        total_productos=resultado[0],
        unidades_disponibles=resultado[1],
        productos_stock_bajo=resultado[2],
        productos_agotados=resultado[3],
        valor_venta_estimado=resultado[4],
    )
