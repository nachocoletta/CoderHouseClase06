const fs = require("fs");

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async addProduct({ title, description, price, thumbnail, code, stock }) {
    if (!(title && description && price && thumbnail && code && stock)) {
      console.log(`Some data is missing, please check your input`);
      return;
    }
    try {
      const products = await getJSONFromFile(this.path);
      let findedCode = products.find((product) => product.code === code);
      if (!findedCode) {
        let newId = products.length > 0 ? products[products.length - 1].id : 0;
        products.push({
          id: ++newId,
          title,
          description,
          price,
          thumbnail,
          code,
          stock,
        });
        return saveJSONToFile(this.path, products);
      }
    } catch {
      console.log(`The code ${findedCode.code} already exists`);
      // throw new Error(`The code ${findedCode.code} already exists`);
    }
  }
  async getProducts() {
    return getJSONFromFile(this.path);
  }

  async getProductById(id) {
    const products = await getJSONFromFile(this.path);
    const findedProduct = products.find((product) => product.id === id);

    return findedProduct
      ? findedProduct
      : `Product with id ${id} doesn't exists`;
  }

  async updateProduct({
    id,
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
  }) {
    if (!id) {
      // console.log(`You must provide an ID`);
      throw new Error(`You must provide an ID`);
    }

    // si el codigo que quiere actualizar ya existe en el archivo
    const products = await getJSONFromFile(this.path);
    let findedCode = products.find(
      (product) => product.code === code && product.id !== id
    );

    if (findedCode) {
      throw new Error(
        `Provided code ${findedCode.code} already exists, can't update`
      );
    }

    let product = await this.getProductById(id);
    if (typeof product !== "string") {
      // si devuelve un string es porque no encontro el producto
      product.title = title || product.title;
      product.description = description || product.description;
      product.price = price || product.price;
      product.thumbnail = thumbnail || product.thumbnail;
      product.code = code || product.code;
      product.stock = stock || product.stock;

      const data = await getJSONFromFile(this.path);
      const productIndex = data.findIndex((product) => product.id === id);
      data[productIndex] = product;
      await saveJSONToFile(this.path, data);
    } else {
      console.log("no entra");
    }
  }

  async deleteProduct(id) {
    if (!id) {
      console.log(`You must provide an ID`);
      // throw new Error(`You must provide an ID`);
    }

    let product = await this.getProductById(id);

    if (typeof product !== "string") {
      let products = await getJSONFromFile(this.path);
      products = products.filter((pro) => pro.id !== id);
      saveJSONToFile(this.path, products);
      console.log(`Product with id ${id} was deleted`);
      return products;
    } else {
      console.log(`Product with id ${id} doesn't exists`);
      // throw new Error(`Product with id ${id} doesn't exists`);
    }
  }
}

const existFile = async (path) => {
  try {
    await fs.promises.access(path);
    return true;
  } catch (error) {
    return false;
  }
};

const getJSONFromFile = async (path) => {
  if (!(await existFile(path))) {
    return [];
  }

  let content;

  try {
    content = await fs.promises.readFile(path, "utf-8");
  } catch (error) {
    throw new Error(`El archivo ${path} no pudo ser leido.`);
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`El archivo ${path} no tiene un formato JSON válido.`);
  }
};

const saveJSONToFile = async (path, data) => {
  const content = JSON.stringify(data, null, "\t");
  try {
    await fs.promises.writeFile(path, content, "utf-8");
  } catch (error) {
    throw new Error(`El archivo ${path} no pudo ser escrito.`);
  }
};

(async function (run) {
  if (!run) return;

  // Se creará una instancia de la clase “ProductManager”
  const productManager = new ProductManager("./products.json");

  // Se llamará “getProducts” recién creada la instancia, debe devolver un arreglo vacío []
  console.log(await productManager.getProducts());

  setTimeout(async () => {
    // Se llamará al método “addProduct” con los campos:
    // title: “producto prueba”
    // description:”Este es un producto prueba”
    // price:200,
    // thumbnail:”Sin imagen”
    // code:”abc123”,
    // stock:25

    // El objeto debe agregarse satisfactoriamente con un id generado automáticamente SIN REPETIRSE
    // esto se hace en la funcion addProduct

    await productManager.addProduct({
      title: "producto prueba",
      description: "Este es un producto de prueba",
      price: 200,
      thumbnail: "Sin imagen",
      code: "abc123",
      stock: 25,
    });
    await productManager.addProduct({
      title: "producto2",
      description: "Este es otro producto de prueba",
      price: 220,
      thumbnail: "Imagen no disponible",
      code: "cde321",
      stock: 25,
    });
    await productManager.addProduct({
      title: "producto prueba",
      description: "Este es un producto de prueba",
      price: 350,
      thumbnail: "Imagen no disponible",
      code: "abc1234",
      stock: 25,
    });
  }, 3000);
  // await productManager.addProduct({
  //   title: "producto prueba 3",
  //   description: "Este es otro producto de prueba",
  //   price: 350,
  //   thumbnail: "Imagen no disponible",
  //   code: "abc123",
  //   stock: 25,
  // });

  setTimeout(async () => {
    // Se llamará el método “getProducts” nuevamente, esta vez debe aparecer el producto recién agregado
    const products = await productManager.getProducts();
    console.log("😎 Acá los productos:", products);

    // Se llamará al método “getProductById” y se corroborará que devuelva el producto con el id especificado, en caso de no existir, debe arrojar un error.

    console.log("Product with id 1: ", await productManager.getProductById(1));
    console.log(
      "Product with id 234: ",
      await productManager.getProductById(234)
    );
  }, 5000);
  // const products = await productManager.getProducts();
  // console.log("😎 Acá los productos:", products);

  setTimeout(async () => {
    // Se llamará al método “updateProduct” y se intentará cambiar un campo de algún producto, se evaluará que no se elimine el id y que sí se haya hecho la actualización.
    await productManager.updateProduct({
      id: 2,
      title: "producto con id 4",
      description: "Descripcion de producto2",
      price: 33,
      // thumbnail: "Imagen no disponible",
      code: "fff232",
      stock: 25,
    });

    // Se llamará al método “deleteProduct”, se evaluará que realmente se elimine el producto o que arroje un error en caso de no existir.
    await productManager.deleteProduct(1);
    await productManager.deleteProduct(225);
  }, 7000);
})(false);

module.exports = { ProductManager, getJSONFromFile, saveJSONToFile };
