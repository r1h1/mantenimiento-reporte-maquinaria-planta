namespace mantoMaquinariaPlanta.Models
{
    public class Usuarios
    {
        public int IdUsuario { get; set; }
        public string NombreCompleto { get; set; }
        public string? TelefonoPersonal { get; set; }
        public string? TelefonoCorporativo { get; set; }
        public string? Direccion { get; set; }
        public string CorreoElectronico { get; set; }
        public int? IdArea { get; set; }
        public string? Usuario { get; set; }
        public int? IdRol { get; set; }
        public bool Estado { get; set; }
    }

    public class UsuarioConAuth
    {
        public Usuarios Usuario { get; set; } = null!;
        public Auth Auth { get; set; } = null!;
    }
}