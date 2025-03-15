using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using mantoMaquinariaPlanta.Data;
using mantoMaquinariaPlanta.Models;
using Microsoft.AspNetCore.Authorization;

namespace mantoMaquinariaPlanta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinalizacionesController : ControllerBase
    {
        private readonly FinalizacionData _data;

        public FinalizacionesController(FinalizacionData data)
        {
            _data = data;
        }

        // GET: api/Finalizaciones - Obtener todas las finalizaciones activas
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Finalizaciones/{id} - Obtener una finalización por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var finalizacion = await _data.ObtenerId(id);
            if (finalizacion == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Finalización no encontrada" });
            }
            return Ok(finalizacion);
        }

        // POST: api/Finalizaciones - Crear una finalización
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Finalizacion finalizacion)
        {
            if (finalizacion == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(finalizacion);
            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Finalización creada exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear la finalización" });
        }

        // PUT: api/Finalizaciones - Editar una finalización
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Finalizacion finalizacion)
        {
            if (finalizacion == null || finalizacion.IdFinalizacion == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            bool respuesta = await _data.Editar(finalizacion);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Finalización actualizada correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Finalización no encontrada" });
        }

        // DELETE: api/Finalizaciones/{id} - Eliminación lógica de una finalización
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Finalización desactivada correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Finalización no encontrada" });
        }
    }
}