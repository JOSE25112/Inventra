from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Literal
from pydantic import EmailStr
# categorias 

from pydantic import BaseModel, ConfigDict, Field








class CategoriaCrear(BaseModel):
    nombre: str = Field(
        min_length=1,
        max_length=100
    )

    descripcion: str | None = Field(
        default=None,
        max_length=255
    )


class CategoriaRespuesta(CategoriaCrear):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# productos
class ProductoBase(BaseModel):
    sku: str = Field(min_length=1, max_length=50)
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = Field(
        default=None, max_length=500
    )
    precio: Decimal = Field(
        ge=0, max_digits=12, decimal_places=2
    )
    stock_minimo: int = Field(default=5, ge=0)
    categoria_id: int = Field(gt=0)

    # Rechazar campos desconocidos, incluido "stock"
    model_config = ConfigDict(extra="forbid")


class ProductoCrear(ProductoBase):
    pass


class ProductoActualizar(ProductoBase):
    pass


class ProductoRespuesta(ProductoBase):
    id: int
    stock: int

    model_config = ConfigDict(from_attributes=True)


#movimientos
class MovimientoCrear(BaseModel):
    producto_id: int = Field(gt=0)
    tipo: Literal["entrada", "salida"]
    cantidad: int = Field(gt=0)

class MovimientoRespuesta(MovimientoCrear):
    id: int
    usuario_id: int
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)

class MovimientoDetalle(BaseModel):
    id: int
    producto_id: int
    producto_nombre: str
    producto_sku: str
    usuario_id: int
    tipo: Literal["entrada","salida"]
    cantidad: int
    fecha: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UsuarioRespuesta(BaseModel):
    id : int
    nombre : str
    email : EmailStr
    rol : str

    model_config = ConfigDict(from_attributes=True)

class UsuarioCrear(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    rol: Literal["admin", "empleado"]


class UsuarioListado(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str

    model_config = ConfigDict(from_attributes=True)

