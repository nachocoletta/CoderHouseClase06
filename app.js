const { ProductManager } = require("./productManager");
const express = require("express");

const PORT = 8080;

const path = "./products.json";

const app = express();

app.use(express.urlencoded({ extended: true }));


app.get("/products", async (req, res) => {

  const { limit } = req.query;

  const productManager = new ProductManager(path);

  const products = await productManager.getProducts();

  return !limit
    ? res.status(200).send(products)
    : res.json(products.slice(0, parseInt(limit)));
});

app.get("/products/:idProduct", async (req, res) => {
  const { idProduct } = req.params;

  const product = new ProductManager(path);
  
  const findedProduct = await product.getProductById(parseInt(idProduct));

  return findedProduct
    ? res.json(findedProduct)
    : res.send(`Product with id ${idProduct} doesn't exists.`);
});

const productManager = new ProductManager(path);

const initiateFile = async () => {
  for (let i = 0; i < 10; i++) {
    await productManager.addProduct({
      title: `Producto ${i + 1}`,
      description: `Este es el producto ${i + 1}`,
      price: Math.floor(Math.random() * 1000),
      thumbnail: `Sin imagen`,
      code: `abc${i + 1}`,
      stock: Math.floor(Math.random() * 200),
    });
  }
};

const startServer = async () => {
  let products = await productManager.getProducts();
  if(!products.length){
    await initiateFile();
  }
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

startServer();

