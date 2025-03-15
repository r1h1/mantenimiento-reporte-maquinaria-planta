-- =============================================
-- Crear una nueva finalización
-- =============================================
CREATE PROCEDURE sp_CrearFinalizacion
    @IdAsignacion INT,
    @FechaFinTrabajo DATE,
    @DescripcionSolucion NVARCHAR(1000),
    @EstadoFinalizado NVARCHAR(50) = 'Finalizado'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Finalizaciones (IdAsignacion, FechaFinTrabajo, DescripcionSolucion, EstadoFinalizado, Estado)
    VALUES (@IdAsignacion, @FechaFinTrabajo, @DescripcionSolucion, @EstadoFinalizado, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdFinalizacion; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todas las finalizaciones activas
-- =============================================
CREATE PROCEDURE sp_ObtenerFinalizaciones
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdFinalizacion, IdAsignacion, FechaFinTrabajo, DescripcionSolucion, EstadoFinalizado, Estado
    FROM Finalizaciones
    WHERE Estado = 1; -- Solo finalizaciones activas
END;

-- =============================================
-- Obtener una finalización por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerFinalizacionPorId
    @IdFinalizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdFinalizacion, IdAsignacion, FechaFinTrabajo, DescripcionSolucion, EstadoFinalizado, Estado
    FROM Finalizaciones
    WHERE IdFinalizacion = @IdFinalizacion;
END;

-- =============================================
-- Actualizar una finalización por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarFinalizacion
    @IdFinalizacion INT,
    @IdAsignacion INT,
    @FechaFinTrabajo DATE,
    @DescripcionSolucion NVARCHAR(1000),
    @EstadoFinalizado NVARCHAR(50),
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Finalizaciones
    SET IdAsignacion = @IdAsignacion,
        FechaFinTrabajo = @FechaFinTrabajo,
        DescripcionSolucion = @DescripcionSolucion,
        EstadoFinalizado = @EstadoFinalizado,
        Estado = @Estado
    WHERE IdFinalizacion = @IdFinalizacion;
END;

-- =============================================
-- Eliminar una finalización de forma lógica (desactivarla)
-- =============================================
CREATE PROCEDURE sp_EliminarFinalizacion
    @IdFinalizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Finalizaciones
    SET Estado = 0
    WHERE IdFinalizacion = @IdFinalizacion;
END;
