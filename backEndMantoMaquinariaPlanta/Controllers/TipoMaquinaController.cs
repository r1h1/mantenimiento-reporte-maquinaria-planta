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
    public class TipoMaquinasController : ControllerBase
    {
        private readonly TipoMaquinaData _data;

        public TipoMaquinasController(TipoMaquinaData data)
        {
            _data = data;
        }

        // GET: api/TipoMaquinas - Obtener todos los tipos de máquinas activas
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/TipoMaquinas/{id} - Obtener un tipo de máquina por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var tipoMaquina = await _data.ObtenerId(id);
            if (tipoMaquina == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Tipo de máquina no encontrado" });
            }
            return Ok(tipoMaquina);
        }

        // POST: api/TipoMaquinas - Crear un tipo de máquina
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] TipoMaquina tipoMaquina)
        {
            if (tipoMaquina == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(tipoMaquina);

            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Tipo de máquina creado exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear el tipo de máquina" });
        }

        // PUT: api/TipoMaquinas - Editar un tipo de máquina
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] TipoMaquina tipoMaquina)
        {
            if (tipoMaquina == null || tipoMaquina.IdTipoMaquina == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            var tipoMaquinaExistente = await _data.ObtenerId(tipoMaquina.IdTipoMaquina);
            if (tipoMaquinaExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Tipo de máquina no encontrado" });
            }

            bool respuesta = await _data.Editar(tipoMaquina);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Tipo de máquina actualizado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el tipo de máquina, pero existe" });
        }

        // DELETE: api/TipoMaquinas/{id} - Eliminación lógica de un tipo de máquina
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID inválido" });
            }

            var tipoMaquinaExistente = await _data.ObtenerId(id);
            if (tipoMaquinaExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Tipo de máquina no encontrado" });
            }

            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Tipo de máquina desactivado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el tipo de máquina, pero existe" });
        }
    }
}