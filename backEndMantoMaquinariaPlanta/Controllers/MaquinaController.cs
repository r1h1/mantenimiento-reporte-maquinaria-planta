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
    public class MaquinasController : ControllerBase
    {
        private readonly MaquinaData _data;

        public MaquinasController(MaquinaData data)
        {
            _data = data;
        }

        // GET: api/Maquinas - Obtener todas las máquinas activas
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Maquinas/{id} - Obtener una máquina por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var maquina = await _data.ObtenerId(id);
            if (maquina == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Máquina no encontrada" });
            }
            return Ok(maquina);
        }

        // GET: api/Maquinas/area/{idArea} - Filtrar por área
        [HttpGet("area/{idArea}")]
        [Authorize]
        public async Task<IActionResult> FiltrarPorArea(int idArea)
        {
            if (idArea <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID de área inválido" });
            }

            var lista = await _data.FiltrarPorArea(idArea);

            if (lista == null || lista.Count == 0)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "No se encontraron máquinas en el área indicada" });
            }

            return Ok(new { code = 200, isSuccess = true, data = lista });
        }


        // POST: api/Maquinas - Crear una máquina
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Maquina maquina)
        {
            if (maquina == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(maquina);

            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Máquina creada exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear la máquina" });
        }

        // PUT: api/Maquinas - Editar una máquina
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Maquina maquina)
        {
            if (maquina == null || maquina.IdMaquina == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            var maquinaExistente = await _data.ObtenerId(maquina.IdMaquina);
            if (maquinaExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Máquina no encontrada" });
            }

            bool respuesta = await _data.Editar(maquina);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Máquina actualizada correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en la máquina, pero existe" });
        }

        // DELETE: api/Maquinas/{id} - Eliminación lógica de una máquina
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID inválido" });
            }

            var maquinaExistente = await _data.ObtenerId(id);
            if (maquinaExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Máquina no encontrada" });
            }

            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Máquina desactivada correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en la máquina, pero existe" });
        }
    }
}