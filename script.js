/* ==========================================
   CLOUDCART
   SCRIPT.JS - PART 1
========================================== */

// ==========================================
// API URL
// ==========================================

const API_URL =
"https://hygtvss5cf.execute-api.ap-south-1.amazonaws.com/prod/products";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let products = [];
let filteredProducts = [];
let cart = [];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

});


// ==========================================
// FETCH PRODUCTS FROM AWS
// ==========================================

async function loadProducts(){

    const loading =
    document.getElementById("loading");

    loading.style.display = "block";

    try{

        const response =
        await fetch(API_URL);

        if(!response.ok){

            throw new Error("Unable to fetch products.");

        }

        const data =
        await response.json();

        products = data;

        filteredProducts = [...products];

        displayProducts(filteredProducts);

    }

    catch(error){

        console.error(error);

        document.getElementById("productContainer").innerHTML =

        `
        <h2 style="text-align:center;color:red;">
        Failed to load products.
        </h2>
        `;

    }

    finally{

        loading.style.display = "none";

    }

}



// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(productList){

    const container =
    document.getElementById("productContainer");

    container.innerHTML = "";

    if(productList.length===0){

        container.innerHTML=

        `
        <h2 style="text-align:center;">
        No Products Found
        </h2>
        `;

        return;

    }

    productList.forEach(product=>{

        container.innerHTML += createCard(product);

    });

}



// ==========================================
// CREATE PRODUCT CARD
// ==========================================

function createCard(product){

    return `

    <div
class="product-card"

onclick="openModal('${product.productId}')">

        <div class="category">

            ${product.category}

        </div>

        <img
    src="${product.image}"
    alt="${product.name}"
    class="product-image">

        <h2>

            ${product.name}

        </h2>

        <p class="Brand">

            Brand :
            <strong>${product.Brand}</strong>

        </p>

        <div class="rating">

            ${generateStars(product.rating)}

            (${product.rating})

        </div>

        <p class="description">

            ${product.description}

        </p>

        <div class="price">

            ${formatPrice(product.price)}

        </div>

        ${stockBadge(product.Stock)}

        <button

            class="add-cart"

            onclick="event.stopPropagation(); addToCart('${product.productId}')">

            <i class="fa-solid fa-cart-plus"></i>

            Add to Cart

        </button>

    </div>

    `;

}



// ==========================================
// PRICE FORMAT
// ==========================================

function formatPrice(price){

    return "₹" +

    Number(price)

    .toLocaleString("en-IN");

}



// ==========================================
// STAR RATING
// ==========================================

function generateStars(rating){

    let stars = "";

    const fullStars =
    Math.floor(rating);

    for(let i=0;i<fullStars;i++){

        stars +=

        '<i class="fa-solid fa-star"></i>';

    }

    if(rating % 1 >= 0.5){

        stars +=

        '<i class="fa-solid fa-star-half-stroke"></i>';

    }

    return stars;

}



// ==========================================
// STOCK BADGE
// ==========================================

function stockBadge(stock){

    if(stock > 10){

        return `
        <div class="stock in-stock">
            🟢 In Stock
        </div>
        `;

    }

    else if(stock > 0){

        return `
        <div class="stock low-stock">
            🟡 Low Stock
        </div>
        `;

    }

    else{

        return `
        <div class="stock out-stock">
            🔴 Out of Stock
        </div>
        `;

    }

}

/* ==========================================
   CLOUDCART
   SCRIPT.JS - PART 2
========================================== */


// ==========================================
// SEARCH PRODUCTS
// ==========================================

const searchInput =
document.getElementById("searchInput");

searchInput.addEventListener("input", function(){

    const keyword =
    this.value
    .trim()
    .toLowerCase();

    filteredProducts =
    products.filter(product =>

        product.name.toLowerCase().includes(keyword) ||

        product.Brand.toLowerCase().includes(keyword) ||

        product.category.toLowerCase().includes(keyword)

    );

    displayProducts(filteredProducts);

});




// ==========================================
// CATEGORY FILTER
// ==========================================

const filterButtons =
document.querySelectorAll(".filter-btn");

filterButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        filterButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        const category =
        button.dataset.category;

        if(category==="All"){

            filteredProducts=[...products];

        }

        else{

            filteredProducts=
            products.filter(product=>

                product.category===category

            );

        }

        const keyword =
        searchInput.value
        .trim()
        .toLowerCase();

        if(keyword!==""){

            filteredProducts=
            filteredProducts.filter(product=>

                product.name.toLowerCase().includes(keyword) ||

                product.Brand.toLowerCase().includes(keyword)

            );

        }

        displayProducts(filteredProducts);

    });

});




// ==========================================
// DARK MODE
// ==========================================

const themeToggle =
document.getElementById("themeToggle");

const savedTheme =
localStorage.getItem("theme");

if(savedTheme==="dark"){

    document.body.classList.add("dark");

    themeToggle.textContent="☀️";

}

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeToggle.textContent="☀️";

    }

    else{

        localStorage.setItem("theme","light");

        themeToggle.textContent="🌙";

    }

});




// ==========================================
// CART SIDEBAR
// ==========================================

const cartSidebar =
document.getElementById("cartSidebar");

const cartBtn =
document.getElementById("cartBtn");

const closeCart =
document.getElementById("closeCart");


cartBtn.addEventListener("click",()=>{

    cartSidebar.classList.add("open");

});


closeCart.addEventListener("click",()=>{

    cartSidebar.classList.remove("open");

});




// ==========================================
// CLOSE CART WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click",(event)=>{

    if(

        cartSidebar.classList.contains("open")

        &&

        !cartSidebar.contains(event.target)

        &&

        !cartBtn.contains(event.target)

    ){

        cartSidebar.classList.remove("open");

    }

});




// ==========================================
// ESC KEY CLOSES CART
// ==========================================

document.addEventListener("keydown",(event)=>{

    if(event.key==="Escape"){

        cartSidebar.classList.remove("open");

    }

});




// ==========================================
// OPTIONAL:
// SORT PRODUCTS BY NAME
// ==========================================

function sortProductsAZ(){

    filteredProducts.sort((a,b)=>

        a.name.localeCompare(b.name)

    );

    displayProducts(filteredProducts);

}




// ==========================================
// OPTIONAL:
// SORT PRODUCTS BY PRICE
// ==========================================

function sortProductsLowToHigh(){

    filteredProducts.sort((a,b)=>

        Number(a.price)-Number(b.price)

    );

    displayProducts(filteredProducts);

}




// ==========================================
// OPTIONAL:
// SORT PRODUCTS BY RATING
// ==========================================

function sortProductsByRating(){

    filteredProducts.sort((a,b)=>

        b.rating-a.rating

    );

    displayProducts(filteredProducts);

}
/* ==========================================
   CLOUDCART
   SCRIPT.JS - PART 3
========================================== */


// ==========================================
// LOAD CART FROM LOCAL STORAGE
// ==========================================

cart =
JSON.parse(localStorage.getItem("cart")) || [];

updateCart();



// ==========================================
// ADD PRODUCT TO CART
// ==========================================

function addToCart(productId){

    const product =
    products.find(item => item.productId === productId);

    if(!product){
        return;
    }

    // Add this block
    if (product.Stock <= 0) {
        showToast("Product is out of stock.");
        return;
    }

    const existingItem =
    cart.find(item => item.productId === productId);

    if(existingItem){
        existingItem.quantity++;
    }
    else{
        cart.push({
            ...product,
            quantity:1
        });
    }

    saveCart();

    showToast(`${product.name} added to cart`);
}



// ==========================================
// SAVE CART
// ==========================================

function saveCart(){

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    updateCart();

}



// ==========================================
// UPDATE CART
// ==========================================

function updateCart(){

    const cartItems =
    document.getElementById("cartItems");

    const cartCount =
    document.getElementById("cartCount");

    const cartTotal =
    document.getElementById("cartTotal");

    cartItems.innerHTML="";

    if(cart.length===0){

        cartItems.innerHTML=

        `<p class="empty-cart">

        Your cart is empty.

        </p>`;

        cartCount.textContent="0";

        cartTotal.textContent="₹0";

        return;

    }

    let total=0;

    let count=0;

    cart.forEach(item=>{

        total +=
        Number(item.price) *
        item.quantity;

        count +=
        item.quantity;

        cartItems.innerHTML +=

        `

        <div class="cart-item">

            <h4>

                ${item.name}

            </h4>

            <p>

                ${formatPrice(item.price)}

            </p>

            <div class="quantity-controls">

                <button

                onclick="decreaseQuantity('${item.productId}')">

                -

                </button>

                <span>

                ${item.quantity}

                </span>

                <button

                onclick="increaseQuantity('${item.productId}')">

                +

                </button>

            </div>

            <button

            class="remove-btn"

            onclick="removeItem('${item.productId}')">

            Remove

            </button>

        </div>

        `;

    });

    cartCount.textContent=count;

    cartTotal.textContent=

    formatPrice(total);

}



// ==========================================
// INCREASE QUANTITY
// ==========================================

function increaseQuantity(productId){

    const item =
    cart.find(product=>product.productId===productId);

    if(item){

        item.quantity++;

    }

    saveCart();

}



// ==========================================
// DECREASE QUANTITY
// ==========================================

function decreaseQuantity(productId){

    const item =
    cart.find(product=>product.productId===productId);

    if(!item){

        return;

    }

    item.quantity--;

    if(item.quantity<=0){

        cart=

        cart.filter(product=>

            product.productId!==productId

        );

    }

    saveCart();

}



// ==========================================
// REMOVE ITEM
// ==========================================

function removeItem(productId){

    cart=

    cart.filter(product=>

        product.productId!==productId

    );

    saveCart();

}



// ==========================================
// CLEAR CART
// ==========================================

document

.getElementById("clearCart")

.addEventListener("click",()=>{

    cart=[];

    saveCart();

    showToast("Cart cleared.");

});




// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message){

    let toast=

    document.querySelector(".toast");

    if(!toast){

        toast=

        document.createElement("div");

        toast.className="toast";

        document.body.appendChild(toast);

    }

    toast.textContent=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}
// ==========================================
// PRODUCT MODAL
// ==========================================

const modal =
document.getElementById("productModal");

const closeModal =
document.getElementById("closeModal");

let selectedProduct=null;

function openModal(productId){

    selectedProduct=

    products.find(

        p=>p.productId===productId

    );

    if(!selectedProduct){

        return;

    }

    document.getElementById("modalName").textContent=

    selectedProduct.name;

    document.getElementById("modalBrand").innerHTML=

    "<strong>Brand :</strong> "

    +selectedProduct.Brand;

    document.getElementById("modalCategory").innerHTML=

    "<span class='category'>"

    +selectedProduct.category+

    "</span>";

    document.getElementById("modalRating").innerHTML=

    generateStars(selectedProduct.rating)

    +" ("+

    selectedProduct.rating+

    ")";

    document.getElementById("modalPrice").textContent=

    formatPrice(selectedProduct.price);

    document.getElementById("modalStock").innerHTML=

    stockBadge(selectedProduct.Stock);

    document.getElementById("modalDescription").textContent=

    selectedProduct.description;

    modal.classList.add("show");

}

closeModal.onclick=function(){

    modal.classList.remove("show");

}

window.onclick=function(event){

    if(event.target===modal){

        modal.classList.remove("show");

    }

}

document

.getElementById("modalCartBtn")

.addEventListener("click",()=>{

    if(selectedProduct){

        addToCart(

            selectedProduct.productId

        );

    }

    modal.classList.remove("show");

});