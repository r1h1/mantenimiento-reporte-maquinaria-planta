using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class UsuarioData
    {
        private readonly string _conexion;

        public UsuarioData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los usuarios activos
        public async Task<List<Usuarios>> Lista()
        {
            List<Usuarios> lista = new List<Usuarios>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerUsuarios", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Usuarios
                        {
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            NombreCompleto = reader.GetString("NombreCompleto"),
                            TelefonoPersonal = reader["TelefonoPersonal"] as string,
                            TelefonoCorporativo = reader["TelefonoCorporativo"] as string,
                            Direccion = reader["Direccion"] as string,
                            CorreoElectronico = reader.GetString("CorreoElectronico"),
                            IdArea = reader["IdArea"] as int?,
                            Usuario = reader["Usuario"] as string,  // Puede ser null
                            IdRol = reader["IdRol"] as int?,  // Puede ser null
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un usuario por ID
        public async Task<Usuarios?> ObtenerId(int id)
        {
            Usuarios? usuario = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerUsuarioPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdUsuario", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        usuario = new Usuarios
                        {
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            NombreCompleto = reader.GetString("NombreCompleto"),
                            TelefonoPersonal = reader["TelefonoPersonal"] as string,
                            TelefonoCorporativo = reader["TelefonoCorporativo"] as string,
                            Direccion = reader["Direccion"] as string,
                            CorreoElectronico = reader.GetString("CorreoElectronico"),
                            IdArea = reader["IdArea"] as int?,
                            Usuario = reader["Usuario"] as string,
                            IdRol = reader["IdRol"] as int?,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return usuario;
        }


        public async Task<bool> CrearUsuarioConAuth(UsuarioConAuth modelo, AuthData authData)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                using (var tran = con.BeginTransaction())
                {
                    try
                    {
                        // 1. Insertar en Usuarios
                        SqlCommand cmdUsuario = new SqlCommand("sp_CrearUsuario", con, tran);
                        cmdUsuario.CommandType = CommandType.StoredProcedure;

                        cmdUsuario.Parameters.AddWithValue("@NombreCompleto", modelo.Usuario.NombreCompleto);
                        cmdUsuario.Parameters.AddWithValue("@TelefonoPersonal", (object)modelo.Usuario.TelefonoPersonal ?? DBNull.Value);
                        cmdUsuario.Parameters.AddWithValue("@TelefonoCorporativo", (object)modelo.Usuario.TelefonoCorporativo ?? DBNull.Value);
                        cmdUsuario.Parameters.AddWithValue("@Direccion", (object)modelo.Usuario.Direccion ?? DBNull.Value);
                        cmdUsuario.Parameters.AddWithValue("@CorreoElectronico", modelo.Usuario.CorreoElectronico);
                        cmdUsuario.Parameters.AddWithValue("@IdArea", (object)modelo.Usuario.IdArea ?? DBNull.Value);

                        int idUsuario = 0;
                        using (var reader = await cmdUsuario.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                idUsuario = reader.GetInt32(0);
                            }
                        }

                        if (idUsuario <= 0)
                        {
                            tran.Rollback();
                            return false;
                        }

                        // 2. Insertar en Auth
                        modelo.Auth.IdUsuario = idUsuario;
                        modelo.Auth.Clave = BCrypt.Net.BCrypt.HashPassword(modelo.Auth.Clave); // Encriptar clave

                        SqlCommand cmdAuth = new SqlCommand("sp_CrearAuth", con, tran);
                        cmdAuth.CommandType = CommandType.StoredProcedure;

                        cmdAuth.Parameters.AddWithValue("@Usuario", modelo.Auth.Usuario);
                        cmdAuth.Parameters.AddWithValue("@ClaveHasheada", modelo.Auth.Clave);
                        cmdAuth.Parameters.AddWithValue("@IdRol", modelo.Auth.IdRol);
                        cmdAuth.Parameters.AddWithValue("@IdUsuario", idUsuario);

                        int idAuth = 0;
                        using (var reader = await cmdAuth.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                idAuth = reader.GetInt32(0);
                            }
                        }

                        if (idAuth <= 0)
                        {
                            tran.Rollback();
                            return false;
                        }

                        tran.Commit();
                        return true;
                    }
                    catch
                    {
                        tran.Rollback();
                        throw;
                    }
                }
            }
        }


        // Editar un usuario
        public async Task<bool> Editar(Usuarios usuario)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdUsuario", usuario.IdUsuario);
                cmd.Parameters.AddWithValue("@NombreCompleto", usuario.NombreCompleto);
                cmd.Parameters.AddWithValue("@TelefonoPersonal", (object)usuario.TelefonoPersonal ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@TelefonoCorporativo", (object)usuario.TelefonoCorporativo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Direccion", (object)usuario.Direccion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@CorreoElectronico", usuario.CorreoElectronico);
                cmd.Parameters.AddWithValue("@IdArea", (object)usuario.IdArea ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", usuario.Estado);
                cmd.Parameters.AddWithValue("@Usuario", (object)usuario.Usuario ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@IdRol", (object)usuario.IdRol ?? DBNull.Value);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        int filasAfectadas = reader.GetInt32(0);
                        return filasAfectadas > 0;
                    }
                }
            }
            return false;
        }

        // Eliminar (desactivar) un usuario en Usuarios y Auth
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdUsuario", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        int filasAfectadas = reader.GetInt32(0);
                        return filasAfectadas > 0;
                    }
                }
            }
            return false;
        }
    }
}