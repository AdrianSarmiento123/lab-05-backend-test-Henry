const request = require('supertest');
const app = require('../app'); 
const { mensajes, usuarios, publicaciones, sequelize } = require('../models');

describe('Mensajes Directos entre Usuarios', () => {
  let cliente, freelancer, publicacion;

  // Antes de cada prueba, se crean datos simulados (mock)
  beforeEach(async () => {
    // Limpiar la base de datos
    await sequelize.sync({ force: true });

    // Crear usuarios de prueba
    cliente = await usuarios.create({ nombre: 'Cliente', email: 'cliente@test.com', password: '123456', rol: 'cliente' });
    freelancer = await usuarios.create({ nombre: 'Freelancer', email: 'freelancer@test.com', password: '123456', rol: 'freelancer' });

    // Crear una publicación de prueba
    publicacion = await publicaciones.create({ titulo: 'Trabajo Prueba', descripcion: 'Descripción del trabajo', usuarioId: cliente.id });
  });

  // Caso Happy Path: Mensaje enviado correctamente
  test('Happy Path: Enviar mensaje directo exitosamente', async () => {
    // PREPARAR - Datos del mensaje a enviar
    const payload = {
      contenido: 'Hola, estoy interesado en el trabajo.',
      remitenteId: cliente.id,
      destinatarioId: freelancer.id,
      publicacionId: publicacion.id,
    };

    // EJECUTAR - Enviar petición POST a la ruta /directo
    const res = await request(app).post('/directo').send(payload);

    // VALIDAR - Comprobar que la respuesta sea correcta
    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Mensaje enviado directamente');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.estado).toBe('pendiente');
    expect(res.body.data.remitenteId).toBe(cliente.id);
    expect(res.body.data.destinatarioId).toBe(freelancer.id);
  });

  // Caso Unhappy Path: Intentar enviarse un mensaje a sí mismo
  test('Unhappy Path: No se permite enviarse mensajes a uno mismo', async () => {
    // PREPARAR - Datos con remitente y destinatario iguales
    const payload = {
      contenido: 'Mensaje a mí mismo',
      remitenteId: cliente.id,
      destinatarioId: cliente.id,
      publicacionId: publicacion.id,
    };

    // EJECUTAR - Enviar petición POST a la ruta /directo
    const res = await request(app).post('/directo').send(payload);

    // VALIDAR - Comprobar que se rechace la operación
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('No puedes enviarte mensajes a ti mismo.');
  });
});
