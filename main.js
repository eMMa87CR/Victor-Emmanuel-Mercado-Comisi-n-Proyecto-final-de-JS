class Producto {
  constructor(nombre, precio) {
    this.nombre = nombre;
    this.precio = precio;
    this.cantidad = 0;
  }
}

class Carrito {
  constructor() {
    this.productos = [];
  }

  agregarProducto(producto) {
    const existente = this.productos.find((p) => p.nombre === producto.nombre);
    if (existente) {
      existente.cantidad++;
    } else {
      producto.cantidad = 1;
      this.productos.push(producto);
    }
  }

  eliminarProducto(nombre) {
    const index = this.productos.findIndex((p) => p.nombre === nombre);
    if (index !== -1) {
      if (this.productos[index].cantidad > 1) {
        this.productos[index].cantidad--;
      } else {
        this.productos.splice(index, 1);
      }
    }
  }

  calcularTotal() {
    return this.productos.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0
    );
  }

  vaciar() {
    this.productos = [];
  }
}

const carrito = new Carrito();

function mostrarProductos() {
  const productosDiv = document.getElementById("productos");
  productosDiv.innerHTML = "<h2 class='col-12 mb-4'>Productos Disponibles</h2>";

  productos.forEach((producto, index) => {
    const productoElement = document.createElement("div");
    productoElement.className = "col-md-6 col-lg-4 mb-4";
    productoElement.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${producto.nombre}</h5>
          <p class="card-text">Precio: $${producto.precio}</p>
          <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${index})">Agregar al carrito</button>
        </div>
      </div>
    `;
    productosDiv.appendChild(productoElement);
  });
}

function agregarAlCarrito(index) {
  carrito.agregarProducto(productos[index]);
  actualizarCarrito();
  guardarCarritoEnLocalStorage();
}

function actualizarCarrito() {
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total-carrito");

  listaCarrito.innerHTML = "";

  carrito.productos.forEach((producto) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      ${producto.nombre} - $${producto.precio} x ${producto.cantidad}
      <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito('${producto.nombre}')">Eliminar</button>
    `;
    listaCarrito.appendChild(li);
  });

  totalCarrito.textContent = `Total: $${carrito.calcularTotal()}`;
}

function eliminarDelCarrito(nombre) {
  carrito.eliminarProducto(nombre);
  actualizarCarrito();
  guardarCarritoEnLocalStorage();
}

function realizarCompra() {
  if (carrito.productos.length === 0) {
    Swal.fire({
      title: 'Carrito vacío',
      text: 'No hay productos en el carrito para comprar.',
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
  } else {
    Swal.fire({
      title: '¡Compra realizada con éxito!',
      text: `Total: $${carrito.calcularTotal()}. Muchas gracias por su compra.`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.isConfirmed) {
        carrito.vaciar();
        actualizarCarrito();
        guardarCarritoEnLocalStorage();
      }
    });
  }
}

function vaciarCarrito() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Se eliminarán todos los productos del carrito",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, vaciar carrito',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.vaciar();
      actualizarCarrito();
      guardarCarritoEnLocalStorage();
      Swal.fire(
        '¡Carrito vaciado!',
        'El carrito ha sido vaciado con éxito.',
        'success'
      );
    }
  });
}

function guardarCarritoEnLocalStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito.productos));
}

function cargarCarritoDeLocalStorage() {
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    const productosGuardados = JSON.parse(carritoGuardado);
    productosGuardados.forEach((producto) => {
      const prod = new Producto(producto.nombre, producto.precio);
      prod.cantidad = producto.cantidad;
      carrito.agregarProducto(prod);
    });
    actualizarCarrito();
  }
}

let productos = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("productos.json")
    .then((response) => response.json())
    .then((data) => {
      productos = data.productos;
      mostrarProductos();
      cargarCarritoDeLocalStorage();
      agregarEventListeners();
    })
    .catch((error) => {
      console.error("Error al cargar los productos:", error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al cargar los productos. Por favor, intenta de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    });
});

function agregarEventListeners() {
  document
    .getElementById("realizar-compra")
    .addEventListener("click", realizarCompra);
  document
    .getElementById("vaciar-carrito")
    .addEventListener("click", vaciarCarrito);
}
