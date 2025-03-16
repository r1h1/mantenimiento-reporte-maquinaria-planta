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
    public class MenuController : ControllerBase
    {
        private readonly MenuData _data;

        public MenuController(MenuData data)
        {
            _data = data;
        }

        // GET: api/Menu - Obtener todos los menús activos
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Menu/{id} - Obtener un menú por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var menu = await _data.ObtenerId(id);
            if (menu == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Menú no encontrado" });
            }
            return Ok(menu);
        }

        // POST: api/Menu - Crear un menú
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Menu menu)
        {
            if (menu == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(menu);

            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Menú creado exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear el menú" });
        }

        // PUT: api/Menu - Editar un menú
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Menu menu)
        {
            if (menu == null || menu.IdMenu == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            var menuExistente = await _data.ObtenerId(menu.IdMenu);
            if (menuExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Menú no encontrado" });
            }

            bool respuesta = await _data.Editar(menu);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Menú actualizado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el menú, pero existe" });
        }

        // DELETE: api/Menu/{id} - Eliminación lógica de un menú
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID inválido" });
            }

            var menuExistente = await _data.ObtenerId(id);
            if (menuExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Menú no encontrado" });
            }

            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Menú desactivado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el menú, pero existe" });
        }
    }
}
