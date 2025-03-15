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
    public class PlantasController : ControllerBase
    {
        private readonly PlantaData _data;

        public PlantasController(PlantaData data)
        {
            _data = data;
        }

        // GET: api/Plantas - Obtener todas las plantas activas
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Plantas/{id} - Obtener una planta por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var planta = await _data.ObtenerId(id);
            if (planta == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Planta no encontrada" });
            }
            return Ok(planta);
        }

        // POST: api/Plantas - Crear una planta
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Planta planta)
        {
            if (planta == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(planta);

            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Planta creada exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear la planta" });
        }

        // PUT: api/Plantas - Editar una planta
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Planta planta)
        {
            if (planta == null || planta.IdPlanta == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            bool respuesta = await _data.Editar(planta);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Planta actualizada correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Planta no encontrada" });
        }

        // DELETE: api/Plantas/{id} - Eliminación lógica de una planta
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Planta desactivada correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Planta no encontrada" });
        }
    }
}
