const Inventory = require("./inventory");

describe("Inventory System", () => {
  let inventory;

  beforeEach(() => {
    inventory = new Inventory();
    const mockDate = new Date("2023-01-01T00:00:00.000Z");
    jest.spyOn(global, "Date").mockImplementation(() => mockDate);
  });

  describe("Add Product", () => {
    test("should add a new product successfully", () => {
      // PREPARAR
      const product = {
        id: 1,
        name: "Producto 1",
        price: 100,
        stock: 10,
        category: "Electrónica",
      };
      // EJECUTAR
      const response = inventory.addProduct(product);
      // VALIDAR
      expect(response).toEqual({
        id: 1,
        name: "Producto 1",
        price: 100,
        category: "Electrónica",
        stock: 10,
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
      });

      expect(inventory.products).toEqual([
        {
          category: "Electrónica",
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
          id: 1,
          name: "Producto 1",
          price: 100,
          stock: 10,
        },
      ]);

      expect(response.createdAt).toEqual(new Date("2023-01-01T00:00:00.000Z"));
    });

    test("should throw error if payload does not have required fields", () => {
      // PREPARAR
      const payload = {
        id: 5,
        price: 100,
        category: "Electrónica",
      };
      // EJECUTAR y VALIDAR
      expect(() => inventory.addProduct(payload)).toThrow(
        "El producto debe tener id, nombre, precio y categoría"
      );
    });

    test("should throw error if product already exists", () => {
      // PREPARAR
      const payload = {
        id: 1,
        name: "Producto 1",
        price: 100,
        category: "Electrónica",
      };

      const alreadyExistingProduct = {
        id: 1,
        name: "Producto 2",
        price: 300,
        category: "Hogar",
      };
      inventory.addProduct(alreadyExistingProduct);

      // EJECUTAR y VALIDAR
      expect(() => inventory.addProduct(payload)).toThrow(
        "Ya existe un producto con este ID"
      );
    });

    test("should throw error if price is less than 0", () => {
      // PREPARAR
      const payload = {
        id: 1,
        name: "Producto 1",
        price: 0,
        category: "Electrónica",
      };

      // EJECUTAR y VALIDAR
      expect(() => inventory.addProduct(payload)).toThrow(
        "El precio debe ser mayor que cero"
      );
    });
  });

  describe("Update Stock", () => {
    test("should update stock successfully", () => {
      // PREPARAR
      const product = {
        id: 1,
        name: "Producto 1",
        price: 100,
        stock: 10,
        category: "Electrónica",
      };
      inventory.addProduct(product);

      // EJECUTAR
      const updatedProduct = inventory.updateStock(1, 5);

      // VALIDAR
      expect(updatedProduct.stock).toBe(15);
      expect(updatedProduct.updatedAt).toEqual(new Date("2023-01-01T00:00:00.000Z"));
    });

    test("should not allow negative stock", () => {
      // PREPARAR
      const product = {
        id: 1,
        name: "Producto 1",
        price: 100,
        stock: 5,
        category: "Electrónica",
      };
      inventory.addProduct(product);

      // EJECUTAR y VALIDAR
      expect(() => inventory.updateStock(1, -10)).toThrow("No hay suficiente stock disponible");
    });
  });

  describe("Get Products by Category", () => {
    test("should return products in category", () => {
      // PREPARAR
      inventory.addProduct({
        id: 1,
        name: "Producto 1",
        price: 100,
        stock: 5,
        category: "Electrónica",
      });
      inventory.addProduct({
        id: 2,
        name: "Producto 2",
        price: 200,
        stock: 3,
        category: "Electrónica",
      });
      inventory.addProduct({
        id: 3,
        name: "Producto 3",
        price: 150,
        stock: 4,
        category: "Hogar",
      });

      // EJECUTAR
      const electronics = inventory.getProductsByCategory("Electrónica");

      // VALIDAR
      expect(electronics.length).toBe(2);
      expect(electronics).toEqual([
        {
          id: 1,
          name: "Producto 1",
          price: 100,
          stock: 5,
          category: "Electrónica",
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
        },
        {
          id: 2,
          name: "Producto 2",
          price: 200,
          stock: 3,
          category: "Electrónica",
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
        },
      ]);
    });

    test("should throw error for non-existent category", () => {
      // PREPARAR
      inventory.addProduct({
        id: 1,
        name: "Producto 1",
        price: 100,
        stock: 5,
        category: "Electrónica",
      });

      // EJECUTAR y VALIDAR
      expect(() => inventory.getProductsByCategory("Ropa")).toThrow(
        "No se encontraron productos en esta categoría"
      );
    });
  });

  describe("Calculate Total Value", () => {
    test("should calculate total inventory value", () => {
      // PREPARAR
      inventory.addProduct({
        id: 1,
        name: "Producto 1",
        price: 100,
        stock: 5,
        category: "Electrónica",
      });
      inventory.addProduct({
        id: 2,
        name: "Producto 2",
        price: 50,
        stock: 10,
        category: "Hogar",
      });

      // EJECUTAR
      const totalValue = inventory.calculateTotalValue();

      // VALIDAR
      // Total esperado: (100 * 5) + (50 * 10) = 500 + 500 = 1000
      expect(totalValue).toBe(1000);
    });

    test("should return zero for empty inventory", () => {
      // PREPARAR
      // Inventario vacío por defecto

      // EJECUTAR
      const totalValue = inventory.calculateTotalValue();

      // VALIDAR
      expect(totalValue).toBe(0);
    });
  });
});
