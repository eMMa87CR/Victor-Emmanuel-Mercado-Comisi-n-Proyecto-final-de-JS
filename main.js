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
        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
        <div class="card-body">
          <h5 class="card-title">${producto.nombre}</h5>
          <p class="card-text">Precio: $${producto.precio}</p>
          <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${index})">
            <i class="fas fa-cart-plus"></i> Agregar al carrito
          </button>
        </div>
      </div>
    `;
    productosDiv.appendChild(productoElement);
  });
}

function agregarAlCarrito(index) {
  const productoAgregado = productos[index];
  carrito.agregarProducto(productoAgregado);
  actualizarCarrito();
  guardarCarritoEnLocalStorage();

  // Mostrar cartel de producto agregado
  Swal.fire({
    title: '¡Producto agregado!',
    text: `Se ha agregado ${productoAgregado.nombre} al carrito`,
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 800,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
}

function actualizarCarrito() {
  const carritoDropdown = document.getElementById("carrito-dropdown");
  const carritoCantidad = document.getElementById("carrito-cantidad");

  carritoDropdown.innerHTML = '';

  if (carrito.productos.length === 0) {
    carritoDropdown.innerHTML = '<li><span class="dropdown-item-text">El carrito está vacío</span></li>';
  } else {
    carrito.productos.forEach((producto) => {
      const dropdownItem = document.createElement("li");
      dropdownItem.innerHTML = `
        <div class="dropdown-item-text d-flex justify-content-between align-items-center">
          <span>${producto.nombre} - $${producto.precio} x ${producto.cantidad}</span>
          <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito('${producto.nombre}')">
            <i class="fas fa-minus"></i>
          </button>
        </div>
      `;
      carritoDropdown.appendChild(dropdownItem);
    });

    const totalItem = document.createElement("li");
    totalItem.innerHTML = `<div class="dropdown-item-text font-weight-bold">Total: $${carrito.calcularTotal()}</div>`;
    carritoDropdown.appendChild(totalItem);

    const botonesItem = document.createElement("li");
    botonesItem.innerHTML = `
      <div class="dropdown-item-text d-flex justify-content-between">
        <button class="btn btn-sm btn-primary" onclick="realizarCompra()">
          <i class="fas fa-shopping-bag"></i> Comprar
        </button>
        <button class="btn btn-sm btn-danger" onclick="vaciarCarrito()">
          <i class="fas fa-trash"></i> Vaciar
        </button>
      </div>
    `;
    carritoDropdown.appendChild(botonesItem);
  }

  carritoCantidad.textContent = carrito.productos.reduce((total, producto) => total + producto.cantidad, 0);
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
  // Ya no necesitamos estos event listeners
}

// Eliminar la función cargarCarritoDeLocalStorage() si ya no se necesita
