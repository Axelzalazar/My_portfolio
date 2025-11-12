// simulador.js - ecommerce pequeño

const API = '/api/products';
const productListEl = document.getElementById('productList');
const cartListEl = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const addForm = document.getElementById('addForm');

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// util: fetch productos (async) con manejo de errores
async function fetchProducts() {
    try {
        // axios devuelve promise y tiene mejor manejo
        const res = await axios.get(API);
        products = res.data;
        renderProducts();
    } catch (err) {
        console.error('fetchProducts error', err);
        Swal.fire({
        icon: 'error',
        title: 'Error cargando productos',
        text: err?.response?.data?.error || err.message
        });
    }
}

// render productos en DOM
function renderProducts() {
    productListEl.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card p-2';
        card.style.width = '180px';
        card.innerHTML = `
        <img src="${p.img || 'https://picsum.photos/seed/' + p.id + '/300/180'}" style="height:110px;object-fit:cover;border-radius:6px" />
        <h5 class="mt-2">${escapeHtml(p.name)}</h5>
        <p>$${Number(p.price).toFixed(2)}</p>
        <button class="btn btn-sm btn-primary add-btn" data-id="${p.id}">Agregar</button>
        `;
        productListEl.appendChild(card);
    });
}

// agregar al carrito (control simple)
function addToCart(id) {
    const prod = products.find(x => x.id == id);
    if (!prod) return;
    const exist = cart.find(i => i.id == prod.id);
    if (exist) exist.qty++;
    else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
    saveCart();
    renderCart();
    // noti
    Toast('Producto agregado');
    }

    // render carrito
    function renderCart() {
    cartListEl.innerHTML = '';
    if (cart.length === 0) cartListEl.innerHTML = '<p class="text-muted">Carrito vacío</p>';
    cart.forEach(i => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-2';
        div.innerHTML = `
        <div><strong>${escapeHtml(i.name)}</strong> <small class="text-muted">x${i.qty}</small></div>
        <div>
            <button class="btn btn-sm btn-outline-secondary plus" data-id="${i.id}">+</button>
            <button class="btn btn-sm btn-outline-secondary minus" data-id="${i.id}">-</button>
            <button class="btn btn-sm btn-outline-danger remove" data-id="${i.id}">x</button>
        </div>
        `;
        cartListEl.appendChild(div);
    });
    const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    cartTotalEl.textContent = total.toFixed(2);
    cartCountEl.textContent = `(${cart.reduce((s, it) => s + it.qty, 0)})`;
}

// guardar carrito local
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    }

    // checkout async (usa fetch al endpoint /api/checkout - simulación)
    async function checkout() {
    if (cart.length === 0) {
        Swal.fire('Carrito vacío', 'Agrega productos antes de pagar', 'info');
        return;
    }
    try {
        // mostramos loader
        Swal.fire({ title: 'Procesando pago...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await axios.post('/api/checkout', { cart });
        Swal.close();
        if (res.data && res.data.orderId) {
        // exito
        Swal.fire('Compra OK', `Orden: ${res.data.orderId}`, 'success');
        cart = [];
        saveCart();
        renderCart();
        } else {
        throw new Error('Respuesta inválida del servidor');
        }
    } catch (err) {
        Swal.close();
        console.error('checkout error', err);
        Swal.fire('Error en pago', err?.response?.data?.error || err.message, 'error');
    }
}

// pequeños helpers y listeners
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
}
function Toast(msg) {
  // Toast simple con SweetAlert2
    Swal.fire({ toast: true, position: 'top-end', timer: 1200, showConfirmButton: false, icon: 'success', title: msg });
}

// event delegation en productos y carrito
productListEl.addEventListener('click', e => {
    if (e.target.matches('.add-btn')) addToCart(e.target.dataset.id);
});

cartListEl.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (e.target.matches('.plus')) {
        const it = cart.find(i => i.id == id); if (it) { it.qty++; saveCart(); renderCart(); }
    }
    if (e.target.matches('.minus')) {
        const it = cart.find(i => i.id == id); if (it) { it.qty--; if (it.qty<=0) cart = cart.filter(x=>x.id!=id); saveCart(); renderCart(); }
    }
    if (e.target.matches('.remove')) {
        cart = cart.filter(x => x.id != id); saveCart(); renderCart();
    }
});

// limpiar carrito
clearCartBtn.addEventListener('click', () => {
    Swal.fire({
        title: 'Vaciar carrito?',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
    }).then(result => {
        if (result.isConfirmed) {
        cart = []; saveCart(); renderCart();
        Toast('Carrito vaciado');
        }
    });
});

// agregar producto via API (form)
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('pName').value.trim();
    const price = parseFloat(document.getElementById('pPrice').value);
    if (!name || !price || price <= 0) { Swal.fire('Datos inválidos','Revisá nombre y precio','warning'); return; }

    try {
    const res = await axios.post('/api/products', { name, price, img: '' });
    // push local y re-render
    products.push(res.data);
    renderProducts();
    addForm.reset();
    Toast('Producto agregado al API');
    } catch (err) {
        console.error('add product error', err);
        Swal.fire('Error', err?.response?.data?.error || err.message, 'error');
    }
});

// PROMISE demo: función que simula latencia (ejemplo de promesas crudas)
function wait(ms) {
    return new Promise((resolve, reject) => {
        if (ms <= 0) return reject(new Error('ms debe ser > 0'));
        setTimeout(() => resolve('ok'), ms);
    });
}
// ejemplo de uso (no bloquea nada)
wait(500).then(() => console.log('ready')).catch(e => console.warn(e.message));

// inicial
(function init() {
  // mejor manejar errores globalmente
    try {
        fetchProducts();
        renderCart();
    } catch (e) {
        console.error('init error', e);
    }
})();
