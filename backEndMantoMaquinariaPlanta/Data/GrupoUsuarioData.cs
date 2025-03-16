using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class GrupoUsuarioData
    {
        private readonly string _conexion;

        public GrupoUsuarioData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los usuarios de un grupo activo
        public async Task<List<GrupoUsuario>> ObtenerUsuariosDeGrupo(int idGrupo)
        {
            List<GrupoUsuario> lista = new List<GrupoUsuario>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerUsuariosDeGrupo", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdGrupo", idGrupo);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new GrupoUsuario
                        {
                            IdGrupo = reader.GetInt32("IdGrupo"),
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener todos los grupos a los que pertenece un usuario
        public async Task<List<GrupoUsuario>> ObtenerGruposDeUsuario(int idUsuario)
        {
            List<GrupoUsuario> lista = new List<GrupoUsuario>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerGruposDeUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdUsuario", idUsuario);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new GrupoUsuario
                        {
                            IdGrupo = reader.GetInt32("IdGrupo"),
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Agregar un usuario a un grupo (si no existe)
        public async Task<bool> AgregarUsuarioAGrupo(GrupoUsuario grupoUsuario)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_AgregarUsuarioAGrupo", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdGrupo", grupoUsuario.IdGrupo);
                cmd.Parameters.AddWithValue("@IdUsuario", grupoUsuario.IdUsuario);

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

        // Eliminar un usuario de un grupo (desactivación lógica)
        public async Task<bool> EliminarUsuarioDeGrupo(int idGrupo, int idUsuario)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarUsuarioDeGrupo", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdGrupo", idGrupo);
                cmd.Parameters.AddWithValue("@IdUsuario", idUsuario);

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

        // Reactivar un usuario en un grupo (restauración lógica)
        public async Task<bool> ReactivarUsuarioEnGrupo(int idGrupo, int idUsuario)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ReactivarUsuarioEnGrupo", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdGrupo", idGrupo);
                cmd.Parameters.AddWithValue("@IdUsuario", idUsuario);

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