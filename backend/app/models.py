
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    descripcion: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    productos: Mapped[list["Producto"]] = relationship(
        back_populates="categoria"
    )


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(
        String(50), unique=True, index=True
    )
    nombre: Mapped[str] = mapped_column(String(150))
    descripcion: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    precio: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    stock: Mapped[int] = mapped_column(default=0)
    stock_minimo: Mapped[int] = mapped_column(default=5)

    categoria_id: Mapped[int] = mapped_column(
        ForeignKey("categorias.id"),
        index=True
    )

    categoria: Mapped["Categoria"] = relationship(
        back_populates="productos"
    )

    movimientos: Mapped[list["Movimiento"]] = relationship(
        back_populates="producto"
    )

    __table_args__ = (
        CheckConstraint(
            "precio >= 0", name="ck_producto_precio"
        ),
        CheckConstraint(
            "stock >= 0", name="ck_producto_stock"
        ),
        CheckConstraint(
            "stock_minimo >= 0",
            name="ck_producto_stock_minimo"
        ),
    )


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(
        String(150), unique=True
    )
    password_hash: Mapped[str] = mapped_column(String(255))
    rol: Mapped[str] = mapped_column(
        String(30), default="empleado"
    )

    movimientos: Mapped[list["Movimiento"]] = relationship(
        back_populates="usuario"
    )

    __table_args__ = (
        CheckConstraint(
            "rol IN ('admin', 'empleado')",
            name="ck_usuario_rol"
        ),
    )


class Movimiento(Base):
    __tablename__ = "movimientos"

    id: Mapped[int] = mapped_column(primary_key=True)

    producto_id: Mapped[int] = mapped_column(
        ForeignKey("productos.id"), index=True
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"), index=True
    )

    tipo: Mapped[str] = mapped_column(String(10))
    cantidad: Mapped[int] = mapped_column()
    fecha: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    producto: Mapped["Producto"] = relationship(
        back_populates="movimientos"
    )
    usuario: Mapped["Usuario"] = relationship(
        back_populates="movimientos"
    )

    __table_args__ = (
        CheckConstraint(
            "tipo IN ('entrada', 'salida')",
            name="ck_movimiento_tipo"
        ),
        CheckConstraint(
            "cantidad > 0",
            name="ck_movimiento_cantidad"
        ),
    )
