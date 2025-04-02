using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class MaquinaData
    {
        private readonly string _conexion;

        public MaquinaData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todas las máquinas activas
        public async Task<List<Maquina>> Lista()
        {
            List<Maquina> lista = new List<Maquina>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerMaquinas", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Maquina
                        {
                            IdMaquina = reader.GetInt32("IdMaquina"),
                            NombreCodigo = reader.GetString("NombreCodigo"),
                            IdTipoMaquina = reader.GetInt32("IdTipoMaquina"),
                            IdArea = reader["IdArea"] as int?,
                            IdPlanta = reader["IdPlanta"] as int?,
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener una máquina por ID
        public async Task<Maquina?> ObtenerId(int id)
        {
            Maquina? maquina = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerMaquinaPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdMaquina", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        maquina = new Maquina
                        {
                            IdMaquina = reader.GetInt32("IdMaquina"),
                            NombreCodigo = reader.GetString("NombreCodigo"),
                            IdTipoMaquina = reader.GetInt32("IdTipoMaquina"),
                            IdArea = reader["IdArea"] as int?,
                            IdPlanta = reader["IdPlanta"] as int?,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return maquina;
        }



        // Filtrar máquinas por área
        public async Task<List<Maquina>> FiltrarPorArea(int idArea)
        {
            List<Maquina> lista = new List<Maquina>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_FiltrarMaquinasPorArea", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdArea", idArea);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Maquina
                        {
                            IdMaquina = reader.GetInt32("IdMaquina"),
                            NombreCodigo = reader.GetString("NombreCodigo"),
                            IdTipoMaquina = reader.GetInt32("IdTipoMaquina"),
                            IdArea = reader["IdArea"] as int?,
                            IdPlanta = reader["IdPlanta"] as int?,
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }

            return lista;
        }



        // Crear una nueva máquina
        public async Task<int> Crear(Maquina maquina)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearMaquina", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@NombreCodigo", maquina.NombreCodigo);
                cmd.Parameters.AddWithValue("@IdTipoMaquina", maquina.IdTipoMaquina);
                cmd.Parameters.AddWithValue("@IdArea", (object)maquina.IdArea ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@IdPlanta", (object)maquina.IdPlanta ?? DBNull.Value);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        nuevoId = reader.GetInt32(0);
                    }
                }
            }
            return nuevoId;
        }

        // Actualizar una máquina existente
        public async Task<bool> Editar(Maquina maquina)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarMaquina", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdMaquina", maquina.IdMaquina);
                cmd.Parameters.AddWithValue("@NombreCodigo", maquina.NombreCodigo);
                cmd.Parameters.AddWithValue("@IdTipoMaquina", maquina.IdTipoMaquina);
                cmd.Parameters.AddWithValue("@IdArea", (object)maquina.IdArea ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@IdPlanta", (object)maquina.IdPlanta ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", maquina.Estado);

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

        // Eliminar una máquina (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarMaquina", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdMaquina", id);

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