// simulador simple - gestor de productos

// array principal
let products = JSON.parse(localStorage.getItem("products")) || [];

// refs al DOM
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const clearBtn = document.getElementById("clearProducts");

// constructor
function Product(name, price) {
    this.name = name;
    this.price = parseFloat(price);
    this.id = Date.now();
}

// función para renderizar
function renderProducts() {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = "<p>No hay productos cargados 😅</p>";
        return;
    }

products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card p-3";
    card.style.width = "200px";
    card.innerHTML = `
    <h5>${p.name}</h5>
    <p>$${p.price}</p>
    <button class="btn btn-sm btn-outline-danger" data-id="${p.id}">Eliminar</button>
    `;
    productList.appendChild(card);
});
}

// agregar producto
productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value.trim();

    if (name === "" || price === "") return;

    const newProduct = new Product(name, price);
    products.push(newProduct);

    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    productForm.reset();
});

// borrar producto (evento delegado)
productList.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
    const id = e.target.getAttribute("data-id");
    products = products.filter((p) => p.id != id);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    }
});

// limpiar todo
clearBtn.addEventListener("click", () => {
    products = [];
    localStorage.removeItem("products");
    renderProducts();
});

// arranca renderizando lo guardado
renderProducts();
