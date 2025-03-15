using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using mantoMaquinariaPlanta.Data;
using mantoMaquinariaPlanta.Models;
using Microsoft.AspNetCore.Authorization;

namespace mantoMaquinariaPlanta.Controllers
{
    [EnableCors("NuevaPolitica")]
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioData _data;

        public UsuariosController(UsuarioData data)
        {
            _data = data;
        }

        // GET: api/Usuarios - Obtener todos los usuarios activos
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Usuarios/{id} - Obtener un usuario por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var usuario = await _data.ObtenerId(id);
            if (usuario == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Usuario no encontrado" });
            }
            return Ok(usuario);
        }

        // POST: api/Usuarios - Crear un usuario
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Usuarios usuario)
        {
            if (usuario == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(usuario);

            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Usuario creado exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear el usuario" });
        }

        // PUT: api/Usuarios - Editar un usuario
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Usuarios usuario)
        {
            if (usuario == null || usuario.IdUsuario == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            bool respuesta = await _data.Editar(usuario);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Usuario actualizado correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Usuario no encontrado" });
        }
    }
}
