using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using mantoMaquinariaPlanta.Data;
using mantoMaquinariaPlanta.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;

namespace mantoMaquinariaPlanta.Controllers
{
    [EnableCors("NuevaPolitica")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthData _authData;
        private readonly IConfiguration _config;

        public AuthController(AuthData authData, IConfiguration config)
        {
            _authData = authData;
            _config = config;
        }

        // POST: api/Auth/Login - Autenticación de usuario
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Usuario) || string.IsNullOrEmpty(request.Clave))
                return BadRequest(new { message = "Usuario o contraseña no pueden estar vacíos." });

            var usuario = await _authData.ValidarUsuario(request.Usuario);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Clave, usuario.Clave))
            {
                return Unauthorized(new { code = 401, message = "Usuario o contraseña incorrectos." });
            }

            var secretKey = _config.GetSection("settings")["secretkey"];

            if (string.IsNullOrEmpty(secretKey))
                throw new ArgumentNullException("Secret key not found in appsettings.json.");

            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, usuario.Usuario),
                new Claim(ClaimTypes.Role, usuario.IdRol.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenConfig = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(tokenConfig);

            return Ok(new
            {
                code = 200,
                message = "Autenticación exitosa",
                token
            });
        }

        // POST: api/Auth/Register - Registro de usuario con contraseña encriptada
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] Auth usuario)
        {
            if (string.IsNullOrEmpty(usuario.Usuario) || string.IsNullOrEmpty(usuario.Clave))
                return BadRequest(new { message = "Usuario o contraseña no pueden estar vacíos." });

            usuario.Clave = BCrypt.Net.BCrypt.HashPassword(usuario.Clave);

            int nuevoId = await _authData.Registrar(usuario); // Ahora se recibe el ID del usuario registrado

            if (nuevoId == 0)
                return Conflict(new { message = "No se pudo registrar el usuario." });

            return Created("", new { message = "Usuario registrado exitosamente.", id = nuevoId });
        }

        // GET: api/Auth/ValidarToken - Verifica si el token es válido
        [HttpGet("ValidarToken")]
        [Authorize]
        public IActionResult ValidarToken()
        {
            return Ok(new { code = 200, message = "Token válido." });
        }
    }
}
