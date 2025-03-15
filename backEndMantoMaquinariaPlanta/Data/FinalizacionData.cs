using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class FinalizacionData
    {
        private readonly string _conexion;

        public FinalizacionData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todas las finalizaciones activas
        public async Task<List<Finalizacion>> Lista()
        {
            List<Finalizacion> lista = new List<Finalizacion>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerFinalizaciones", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Finalizacion
                        {
                            IdFinalizacion = reader.GetInt32("IdFinalizacion"),
                            IdAsignacion = reader.GetInt32("IdAsignacion"),
                            FechaFinTrabajo = reader.GetDateTime("FechaFinTrabajo"),
                            DescripcionSolucion = reader.GetString("DescripcionSolucion"),
                            EstadoFinalizado = reader.GetString("EstadoFinalizado"),
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener una finalización por ID
        public async Task<Finalizacion?> ObtenerId(int id)
        {
            Finalizacion? finalizacion = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerFinalizacionPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdFinalizacion", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        finalizacion = new Finalizacion
                        {
                            IdFinalizacion = reader.GetInt32("IdFinalizacion"),
                            IdAsignacion = reader.GetInt32("IdAsignacion"),
                            FechaFinTrabajo = reader.GetDateTime("FechaFinTrabajo"),
                            DescripcionSolucion = reader.GetString("DescripcionSolucion"),
                            EstadoFinalizado = reader.GetString("EstadoFinalizado"),
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return finalizacion;
        }

        // Crear una nueva finalización
        public async Task<int> Crear(Finalizacion finalizacion)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearFinalizacion", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdAsignacion", finalizacion.IdAsignacion);
                cmd.Parameters.AddWithValue("@FechaFinTrabajo", finalizacion.FechaFinTrabajo);
                cmd.Parameters.AddWithValue("@DescripcionSolucion", finalizacion.DescripcionSolucion);
                cmd.Parameters.AddWithValue("@EstadoFinalizado", finalizacion.EstadoFinalizado);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        nuevoId = reader.GetInt32(0); // Retorna el ID de la nueva finalización
                    }
                }
            }
            return nuevoId;
        }

        // Actualizar una finalización existente
        public async Task<bool> Editar(Finalizacion finalizacion)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarFinalizacion", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdFinalizacion", finalizacion.IdFinalizacion);
                cmd.Parameters.AddWithValue("@IdAsignacion", finalizacion.IdAsignacion);
                cmd.Parameters.AddWithValue("@FechaFinTrabajo", finalizacion.FechaFinTrabajo);
                cmd.Parameters.AddWithValue("@DescripcionSolucion", finalizacion.DescripcionSolucion);
                cmd.Parameters.AddWithValue("@EstadoFinalizado", finalizacion.EstadoFinalizado);
                cmd.Parameters.AddWithValue("@Estado", finalizacion.Estado);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }

        // Eliminar una finalización (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarFinalizacion", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdFinalizacion", id);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }
    }
}
