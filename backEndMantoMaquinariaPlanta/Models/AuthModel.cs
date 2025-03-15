namespace mantoMaquinariaPlanta.Models
{
    public class Auth
    {
        public int IdAuth { get; set; }
        public string Usuario { get; set; }
        public string Clave { get; set; }  // Se almacenará encriptada en la base de datos
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public int IdRol { get; set; }
        public int IdUsuario { get; set; }
        public bool Estado { get; set; } = true;
    }

    public class LoginRequest
    {
        public string Usuario { get; set; } = null!;
        public string Clave { get; set; } = null!;
    }
}