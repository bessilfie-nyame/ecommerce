/**
 *HELPER CODES REPOSITORY
 *https://github.com/kyonkopa/amalitech-ecommerce
 *
 */


// ==================Fetch Data==============

// to be removed from local!
const productsData = [
	{
		"id": "PROD-1",
		"name": "Boys' Stillwater Sherpa 1/4-Zip",
		"description": "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
		"rating": 4,
		"image": "prod-img-1.jpg",
		"price": { "amount": "98.50", "currency": "$" },
		"sizes": [
			{ "text": "2T" },
			{ "text": "3T" },
			{ "text": "4T" },
			{ "text": "5" },
			{ "text": "6" },
			{ "text": "7" }
		],
		"colors": [
			{
				"text": "Orange",
				"hex": "#f39c12"
			},
			{
				"text": "Nectarine",
				"hex": "#ffbe76"
			},
			{
				"text": "Purple",
				"hex": "#8e44ad"
			}
		]
	}
]

// class Data {

// 	static async fetchData(url){
// 		const response = await fetch(url);
// 		const data = await response.json();
// 		return data;
// 		}

// 	static data(){
// 		this.fetchData('./products.json').then(products => {
// 			return products;
// 		}
// 	)}
// }

// const productsData = Data.data()

// ==============UTILS / UIS=====================

class Utils {
	static select(selector) {
		return document.querySelector(selector);
	}

	static selectAll(selector) {
		return document.querySelectorAll(selector);
	}

	static wait(time) {
		return new Promise((resolve, reject) => {
			window.setTimeout(function () {
				resolve();
			}, time);
		});
	}

	static activateThisIn(
		target,
		selector,
		activeClassName,
		parentSelector = null
		) {
			var active = this.getParentNode(target, parentSelector).querySelector(
				selector + "." + (activeClassName || "active")
			);
			if (active) active.classList.remove(activeClassName || "active");
				target.classList.add(activeClassName || "active");
	}

	static getParentNode(target, selector) {
		var node = target.parentNode;

		if (selector == null) return node;
		else {
			if (node.matches(selector)) return node;
			else return node.matches("body") ? null : getParentNode(node, selector);
		}
	}

	// Check for empty inputs
	static checkEmptyInputs(nodes) {
		var empty = false;

		nodes.forEach(function (node, index) {
			if (node.value == "") {
				Velocity(node, "callout.shake", {
					duration: 400,
				});
				empty = true;
			}
		});
		return empty;
	}

	static fromNodeListToArray(nodeList) {
		return Array.from(nodeList);
	}

	static urlBase64ToUint8Array(base64String) {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/\-/g, "+")
			.replace(/_/g, "/");
		const rawData = window.atob(base64);
		return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
	}

	// Notify user of message
	static notify(message) {
		M.toast({
			html: message,
		});
	}

	static getURL(action) {
		return select("input[data-resource='" + action + "']").value;
	}

	static capitalize(string) {
		return string[0].toUpperCase() + string.slice(1);
	}
}

const View = {
	/**
	 * render function to pass in a template and node/elements
	   to display in
	 * @param model template to pass
	 * @param node to to display template
	 */
	render(model, renderIn) {
		return new Promise((resolve) => {
			// all elements that match this key
			let dataElements = renderIn.querySelectorAll(`[data-var]`);

			/**
			 * Get value from object using string property accessor
			 *
			 * @param obj Object from which to get property
			 * @param str String property accessor
			 *
			 * @returns {any}
			 */
			function ref(obj, str) {
				return str.split(".").reduce(function (o, x) {
					return o ? o[x] : "";
				}, obj);
			}

			dataElements.forEach((element) => {
				const value = ref(model, element.dataset.var);
				this.insertContentIntoDOM(renderIn, [element], value);
			});

			resolve(model);
		});
	},

	async renderList(array, component, config) {
		config = Object.assign(
			{
				onDataAttr: false,
			},
			config
		);

		return new Promise((resolve) => {
			array.forEach((item, index) => {
				// create a copy of the component and insert in its parent node
				let copy = component.cloneNode(true);
				copy.classList.remove("template");

				// set values to data attributes
				if (config.assignDataAttr) {
					for (const key in item) {
						if (item.hasOwnProperty(key)) {
							const value = item[key];
							copy.setAttribute(`data-${key}`, value);
						}
					}
				}

				this.render(item, copy).then(() => {
					component.parentNode.insertAdjacentElement("beforeend", copy);

					if (config.mounted && typeof config.mounted == "function") {
						// call mounted hook
						config.mounted.call(copy, item, index);
					}
				});
			});

			resolve(array);
		});
	},

	insertContentIntoDOM(renderIn, toElements, value) {
		toElements.forEach((toElement) => {
			if (toElement.matches("input, textarea, select")) {
				// set values for form elements
				toElement.value = value;
			} else {
				// set innertext
				toElement.innerText = value;
			}
		});
	},

	update(key, value, component) {
		let toElements = component.querySelectorAll(`[data-var=${key}]`);

		this.insertContentIntoDOM(component, toElements, value);
	},

	getVar(key, component = null) {
		component = component || Utils.select("body");
		const element = component.querySelector(`[data-var=${key}]`);

		if (element) {
			return element.matches("input, textarea, select")
				? element.value
				: element.innerText;
		}
		return element;
	},

	getRef(key, component = null) {
		return component
			? component.querySelector(`[data-var=${key}]`)
			: Utils.select(`[data-var=${key}]`);
	},
};



const Notification = {
	setup() {
		!Utils.select(".notification") &&
			document.body.insertAdjacentHTML(
				"beforeend",
				"<div class='notification'></div>"
			);
	},

	send(message) {
		const component = Utils.select(".notification");
		component.innerText = message;

		component.classList.add("show-notification");

		Utils.wait(3500).then(() => {
			component.classList.remove("show-notification");
		});
	},
};


// =================CART================


const Cart = {
	setup() {
		this.updateCount();
		this.mini.setup();

		const orderSummary = Utils.select(".order-summary");

		Utils.selectAll("table.cart .cart-item:not(.template)").forEach((node) => {
			node.parentNode.removeChild(node);
		});

		localStorage.getItem("product");

		Utils.select("table.cart .cart-item") &&
			View.renderList(this.getCart(), Utils.select("table.cart .cart-item"), {
				// mounted hook for each item
				mounted(product, index) {
					View.getRef("name", this).href = `/?productId=${product.id}`;

					// update product image
					this.querySelector(
						".img"
					).style.backgroundImage = `url(${product.image})`;

					this.querySelector(".actions .del").addEventListener("click", (e) => {
						e.preventDefault();

						const sure = confirm(
							"Are you sure you want to remove this item from cart ?"
						);
						// if sure remove from cart
						sure && Cart.removeItem(index);
					});

					// Initialize quantity controls
					const quantityField = this.querySelector(".quantity-field");

					this.querySelectorAll(".quantity-selector .ctrl").forEach((ctrl) => {
						ctrl.addEventListener("click", () => {
							let value = parseInt(quantityField.value);

							switch (ctrl.dataset.function) {
								case "add":
									quantityField.value = ++value;
									break;

								case "sub":
									if (value > 1) quantityField.value = --value;
									break;
							}

							// Update item in storage
							Cart.updateItem(index, {
								quantity: quantityField.value,
							});

							if (Cart.appliedPromoCode) {
								Utils.wait(800).then(() => {
									// Update discount value
									View.update(
										"discount",
										View.getVar("sub-total") / 2,
										orderSummary
									);

									// Reapply discount
									View.update(
										"total-checkout",
										View.getVar("sub-total") / 2,
										orderSummary
									);
								});
							}
						});
					});
				},
			}).then((products) => {
				console.log("after list render");
				// update sub total value
				View.update(
					"sub-total",
					products.length
						? products
								.map((p) => p.total)
								.reduce((acc, cur) => {
									return acc + cur;
								})
						: 0,
					orderSummary
				);

				// Update total checkout value
				View.update(
					"total-checkout",
					parseFloat(View.getVar("sub-total", orderSummary)),
					orderSummary
				);
			});

		Utils.select(".apply-code-btn") &&
			Utils.select(".apply-code-btn").addEventListener("click", (e) => {
				e.preventDefault();

				Cart.applyPromoCode(View.getVar("promo-code"))
					.then(() => {
						Notification.send(
							"Promo code applied succefully, you have 50% discount on all products!"
						);
						// reset promo code
						View.update("promo-code", "", orderSummary);

						// Update discount value
						View.update("discount", View.getVar("sub-total") / 2, orderSummary);
					})
					.catch(() => {
						// Get element and add error class
						View.getRef("promo-code").classList.add("error");
						Notification.send("Invalid code");
					});
			});
	},

	updateCount() {
		let storedProducts = JSON.parse(localStorage.getItem("products"));
		Utils.select("#cart-count").innerText = storedProducts
			? storedProducts.length
			: 0;

		Utils.select(".cart-page") &&
			View.update(
				"cart-count",
				storedProducts ? storedProducts.length : 0,
				Utils.select(".cart-page")
			);
	},

	mini: {
		component: Utils.select(".mini-cart"),

		setup() {
			if (this.component) {
				// Intialize close button
				this.component
					.querySelector(".close-cart")
					.addEventListener("click", () => {
						this.component.id = ""; 
						Utils.select(".overlay").classList.remove("show");
				});
			}
		},

		async show(product) {
			await View.render(product, this.component);

			View.update("prod-total", product.total, this.component);

			// update product backgroundImage
			this.component.querySelector(
				".img"
			).style.backgroundImage = `url(${product.image})`;

			// show mini cart
			this.component.id = "display-cart";
			Utils.select(".overlay").classList.add("show");
		},

	},

	getCart() {
		let products = [];
		const storedProducts = localStorage.getItem("products");

		if (storedProducts) {
			products = JSON.parse(storedProducts);
		}

		return products;
	},

	removeItem(index) {
		let storedProducts = JSON.parse(localStorage.getItem("products"));

		storedProducts.splice(index, 1);
		localStorage.setItem("products", JSON.stringify(storedProducts));

		// force cart rerender
		this.setup();
	},

	appliedPromoCode: false,

	async applyPromoCode(code) {
		code = code.trim();

		const regex = /^[a-z0-9]+$/i;
		const valid = code.match(regex); // check validity

		return new Promise((resolve, reject) => {
			if (this.appliedPromoCode) {
				reject(code);
				return;
			}

			if (code.length === 5 && valid) {
				this.appliedPromoCode = true;

				View.update(
					"total-checkout",
					View.getVar("total-checkout") / 2,
					Utils.select(".order-summary")
				);

				resolve(code);
			} else {
				reject(code);
			}
		});
	},

	async updateItem(index, config = {}) {
		const products = this.getCart();
		products[index].customization.quantity = config.quantity;

		products[index].total =
			parseFloat(products[index].price.amount) *
			parseInt(products[index].customization.quantity);

		localStorage.setItem("products", JSON.stringify(products));

		// force cart rerender
		this.setup();
	},
};


// ===============PRODUCT===============


const Product = {
	product: null,
	async setup(id) {
		// Fetch product
	 
		this.product = this.fetch(id);

		await View.render(this.product, Utils.select(".prod-details-wrap .product-details-wrapper"));

		await View.renderList(
			this.product.colors,
			Utils.select(".prod-details-wrap .color-picker .cl"),
			{
				assignDataAttr: true,
				mounted(color) {
					this.style.backgroundColor = color.hex;
				},
			}
		);

		await View.renderList(
			this.product.sizes,
			Utils.select(".prod-details-wrap .size-picker .sz"),
			{
				assignDataAttr: true,
			}
		);

		// Initialize size picker
		const sizeSelectors = Utils.fromNodeListToArray(Utils.selectAll(".size-picker .sz"));

		sizeSelectors.map((selector) => {
			selector.addEventListener("click", () => {
				Utils.activateThisIn(selector, ".sz");
			});
		});

		// Initialize quantity selector
		const quantityField = Utils.select("#quantity-field");

		Utils.fromNodeListToArray(Utils.selectAll(".quantity-selector .ctrl")).map((ctrl) => {
			ctrl.addEventListener("click", () => {
				let value = new Number(quantityField.value);

				switch (ctrl.dataset.function) {
					case "add":
						quantityField.value = ++value;
						break;

					case "sub":
						if (value > 1) quantityField.value = --value;
						break;
				}
			});
		});

		// Initialize color selector
		const colorSelectors = Utils.fromNodeListToArray(Utils.selectAll(".color-picker .cl"));

		colorSelectors.map((selector) => {
			selector.addEventListener("click", () => {
				Utils.activateThisIn(selector, ".cl");

				Utils.select("#prod-color-text").innerText = selector.dataset.text;
			});
		});

		// Initialize add to cart button
		Utils.select("#add-to-cart-btn").addEventListener("click", () => {
			this.addToCart();
		});
	},

	fetch(id) {
		// Attempt to fetch product by id from localstorage
		return (productsData || []).find((product) => product.id === id);
	},

	addToCart() {
		const selectedSize = Utils.select(".size-picker > .sz.active"),
			selectedColor = Utils.select(".color-picker .cl.active");

		if (!selectedColor) {
			Notification.send("Please select color");
			return;
		}

		if (!selectedSize) {
			Notification.send("Please select size");
			return;
		}

		let products = [];
		const storedProducts = localStorage.getItem("products");

		if (storedProducts) {
			products = JSON.parse(storedProducts);
		}

		// add if only product is not already in cart
		if (!products.find((product) => product.id === this.product.id) || true) {
			this.product.customization = {
				size: Utils.select(".size-picker > .sz.active").dataset.text,
				quantity: Utils.select("#quantity-field").value,
				color: Utils.select(".color-picker .cl.active").dataset.text,
			};

			this.product.total =
				parseFloat(this.product.price.amount) *
				parseInt(this.product.customization.quantity);

			products.push(this.product);
			localStorage.setItem("products", JSON.stringify(products));

			Cart.updateCount();
			Cart.mini.show(this.product);
		}
	},
};

const App = {

	init() {
		Utils.select("main.product") && Product.setup("PROD-1");
		Notification.setup();
		Cart.setup();
	},
};

App.init();

