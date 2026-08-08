// ================================
// TEMPORARY PRODUCT DATA
// ================================

const API_URL =
    "https://hygtvss5cf.execute-api.ap-south-1.amazonaws.com/prod/admin/products";


let products = [
    {
        id: "P101",
        name: "ASUS TUF A15 Laptop",
        category: "Laptop",
        price: 89999,
        stock: 10
    },
    {
        id: "P102",
        name: "Apple iPhone 16",
        category: "Smartphone",
        price: 79900,
        stock: 8
    },
    {
        id: "P103",
        name: "Samsung Galaxy S25",
        category: "Smartphone",
        price: 74999,
        stock: 12
    },
    {
        id: "P104",
        name: "Sony WH-1000XM5",
        category: "Headphones",
        price: 29990,
        stock: 5
    },
    {
        id: "P105",
        name: "Logitech MX Master 3S",
        category: "Mouse",
        price: 9995,
        stock: 3
    },
    {
        id: "P106",
        name: "Logitech G Pro Mechanical Keyboard",
        category: "Keyboard",
        price: 12999,
        stock: 7
    },
    {
        id: "P107",
        name: 'Samsung 27" Monitor',
        category: "Monitor",
        price: 18999,
        stock: 2
    },
    {
        id: "P108",
        name: "Seagate 1TB External SSD",
        category: "Storage",
        price: 8499,
        stock: 9
    },
    {
        id: "P109",
        name: "boAt Stone Speaker",
        category: "Speaker",
        price: 2999,
        stock: 15
    },
    {
        id: "P110",
        name: "Apple Watch Series 10",
        category: "Smartwatch",
        price: 49900,
        stock: 4
    }
];

async function loadProducts() {

    try {

        const token = localStorage.getItem("idToken");

        if (!token) {
            console.error("No ID token found");
            window.location.href = "index.html";
            return;
        }

        console.log("Loading products from API...");

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("API status:", response.status);

        const rawData = await response.json();

        console.log("Raw API response:", rawData);

        if (!response.ok) {
            console.error("Failed to load products:", rawData);
            return;
        }

        // ==========================================
        // Handle API Gateway / Lambda response
        // ==========================================

        let data = rawData;

        // If Lambda returns body as a JSON string
        if (data.body) {

            try {
                data = typeof data.body === "string"
                    ? JSON.parse(data.body)
                    : data.body;
            } catch (error) {
                console.error("Unable to parse API body:", error);
                return;
            }
        }

        // ==========================================
        // Extract product array
        // ==========================================

        let productList =
            data.products ||
            data.Items ||
            data.items ||
            data;

        if (!Array.isArray(productList)) {

            console.error(
                "Product array not found in API response:",
                data
            );

            return;
        }

        // ==========================================
        // Normalize DynamoDB fields
        // ==========================================

        products = productList.map(product => ({

            id:
                product.productId ||
                product.id,

            name:
                product.name ||
                "Unnamed Product",

            category:
                product.category ||
                "Other",

            price:
                Number(product.price || 0),

            stock:
                Number(
                    product.Stock ??
                    product.stock ??
                    0
                ),

            brand:
                product.Brand ||
                product.brand ||
                "",

            description:
                product.description ||
                "",

            image:
                product.image ||
                "",

            rating:
                Number(product.rating || 0)

        }));

        console.log("Normalized products:", products);

        displayProducts(products);

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

    }
}

// ================================
// DISPLAY PRODUCTS
// ================================

function displayProducts(productList = products) {

    const tableBody =
        document.getElementById("productTableBody");

    tableBody.innerHTML = "";


    productList.forEach(product => {

        const status =
            product.stock <= 3
                ? "Low Stock"
                : "In Stock";

        const stockClass =
            product.stock <= 3
                ? "stock-low"
                : "stock-good";


        const row = document.createElement("tr");

        row.innerHTML = `

            <td>
                <span class="product-name">
                    ${product.name}
                </span>
            </td>

            <td>
                <span class="category">
                    ${product.category}
                </span>
            </td>

            <td>
                ₹${product.price.toLocaleString("en-IN")}
            </td>

            <td>
                <span class="${stockClass}">
                    ${product.stock}
                </span>
            </td>

            <td>
                <span class="${stockClass}">
                    ${status}
                </span>
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editProduct('${product.id}')"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProduct('${product.id}')"
                >
                    Delete
                </button>

            </td>

        `;

        tableBody.appendChild(row);

    });


    updateStatistics();

}


// ================================
// UPDATE STATISTICS
// ================================

function updateStatistics() {

    const total =
        products.length;

    const inStock =
        products.filter(p => p.stock > 3).length;

    const lowStock =
        products.filter(p => p.stock <= 3).length;

    const totalValue =
        products.reduce(
            (sum, product) =>
                sum + (product.price * product.stock),
            0
        );


    document.getElementById("totalProducts")
        .textContent = total;

    document.getElementById("inStock")
        .textContent = inStock;

    document.getElementById("lowStock")
        .textContent = lowStock;

    document.getElementById("totalValue")
        .textContent =
        "₹" + totalValue.toLocaleString("en-IN");
}


// ================================
// SEARCH
// ================================

document
    .getElementById("productSearch")
    .addEventListener("input", function () {

        const search =
            this.value.toLowerCase();

        const filtered =
            products.filter(product =>

                product.name
                    .toLowerCase()
                    .includes(search)

                ||

                product.category
                    .toLowerCase()
                    .includes(search)

            );

        displayProducts(filtered);

    });


// ================================
// MODAL
// ================================

const modal =
    document.getElementById("productModal");

const addProductBtn =
    document.getElementById("addProductBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelBtn =
    document.getElementById("cancelBtn");


addProductBtn.addEventListener(
    "click",
    () => {

        document.getElementById("modalTitle")
            .textContent = "Add Product";

        document.getElementById("productForm")
            .reset();

        document.getElementById("productId")
            .value = "";

        modal.style.display = "flex";

    }
);


closeModal.addEventListener(
    "click",
    closeProductModal
);


cancelBtn.addEventListener(
    "click",
    closeProductModal
);


function closeProductModal() {

    modal.style.display = "none";

}


// ================================
// ADD / EDIT PRODUCT
// ================================

document
    .getElementById("productForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const id =
            document.getElementById("productId").value;

        const name =
            document.getElementById("productName").value;

        const category =
            document.getElementById("productCategory").value;

        const price =
            Number(
                document.getElementById("productPrice").value
            );

        const stock =
            Number(
                document.getElementById("productStock").value
            );


        if (id) {

            // EDIT PRODUCT

            const product =
                products.find(p => p.id === id);

            product.name = name;
            product.category = category;
            product.price = price;
            product.stock = stock;

        } else {

            // ADD PRODUCT

            const newProduct = {

                id:
                    "P" +
                    (101 + products.length),

                name,
                category,
                price,
                stock

            };

            products.push(newProduct);

        }


        displayProducts();

        closeProductModal();

    });


// ================================
// EDIT PRODUCT
// ================================

function editProduct(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) return;


    document.getElementById("modalTitle")
        .textContent = "Edit Product";

    document.getElementById("productId")
        .value = product.id;

    document.getElementById("productName")
        .value = product.name;

    document.getElementById("productCategory")
        .value = product.category;

    document.getElementById("productPrice")
        .value = product.price;

    document.getElementById("productStock")
        .value = product.stock;


    modal.style.display = "flex";

}


// ================================
// DELETE PRODUCT
// ================================

function deleteProduct(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) return;


    const confirmed =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) return;


    products =
        products.filter(p => p.id !== id);


    displayProducts();

}



// ================================
// INITIAL LOAD
// ================================

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});