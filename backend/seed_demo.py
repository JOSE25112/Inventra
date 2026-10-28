
from sqlalchemy import select

from app.database import SessionLocal
from app.models import Categoria, Producto


CATEGORIAS = [
    ("Computadoras", "Laptops y equipos de escritorio"),
    ("Accesorios", "Periféricos y accesorios"),
    ("Impresoras", "Equipos de impresión"),
]

PRODUCTOS = [
    ("LAP-001", "Laptop empresarial", "15999.00", 5, "Computadoras"),
    ("MON-001", "Monitor 24 pulgadas", "3299.00", 3, "Accesorios"),
    ("TEC-001", "Teclado USB", "350.00", 10, "Accesorios"),
    ("MOU-001", "Mouse inalámbrico", "450.00", 10, "Accesorios"),
    ("IMP-001", "Impresora multifuncional", "4200.00", 2, "Impresoras"),
]


def main():
    with SessionLocal() as db:
        for nombre, descripcion in CATEGORIAS:
            existe = db.scalar(
                select(Categoria).where(Categoria.nombre == nombre)
            )
            if existe is None:
                db.add(Categoria(
                    nombre=nombre,
                    descripcion=descripcion
                ))

        db.flush()

        categorias = {
            c.nombre: c.id
            for c in db.scalars(select(Categoria)).all()
        }

        for sku, nombre, precio, minimo, categoria in PRODUCTOS:
            existe = db.scalar(
                select(Producto).where(Producto.sku == sku)
            )
            if existe is None:
                db.add(Producto(
                    sku=sku,
                    nombre=nombre,
                    precio=precio,
                    stock=0,
                    stock_minimo=minimo,
                    categoria_id=categorias[categoria]
                ))

        db.commit()
        print("Catálogo de demostración preparado.")


if __name__ == "__main__":
    main()
