// ViewModel do Produto
function Product(data) {
    this.Id = data.Id;
    this.Name = ko.observable(data.Name);
    this.Price = ko.observable(data.Price);
    this.Description = ko.observable(data.Description);
}

// ViewModel da Aplicação
function AppViewModel() {
    const self = this;

    self.products = ko.observableArray([]); // Lista de produtos
    self.newName = ko.observable("");
    self.newPrice = ko.observable("");
    self.newDescription = ko.observable("");
    self.editingProduct = ko.observable(null); // Produto que está sendo editado

    // Função para carregar os produtos
    self.loadProducts = function() {
        $.get("http://localhost:3000/products", function(data) {
            const mappedProducts = data.map(item => new Product(item));
            self.products(mappedProducts);
        });
    };

    // Função para adicionar um produto
    self.addProduct = function() {
        const product = {
            name: self.newName(),
            price: self.newPrice(),
            description: self.newDescription(),
        };

        console.log("Produto a ser enviado:", product);

        $.ajax({
            url: "http://localhost:3000/products",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(product),
            success: function() {
                self.loadProducts(); // Recarrega a lista de produtos
                self.newName("");
                self.newPrice("");
                self.newDescription("");
            },
            error: function(xhr, status, error) {
                console.error("Erro ao adicionar o produto:", error);
                alert("Erro ao adicionar o produto. Tente novamente.");
            }
        });
    };


    // Função para excluir um produto
    self.deleteProduct = function(product) {
        $.ajax({
            url: `http://localhost:3000/products/${product.Id}`,
            type: "DELETE",
            success: function() {
                self.loadProducts(); // Recarrega a lista de produtos
            },
            error: function(xhr, status, error) {
                console.error("Erro ao excluir o produto:", error);
                alert("Erro ao excluir o produto. Tente novamente.");
            }
        });
    };

    // Inicializa a carga de produtos
    self.loadProducts();
}

// Aplica o binding do Knockout.js
ko.applyBindings(new AppViewModel());
