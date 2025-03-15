-- =============================================
-- Crear una nueva planta
-- =============================================
CREATE PROCEDURE sp_CrearPlanta
    @Nombre NVARCHAR(255),
    @Descripcion NVARCHAR(500),
    @UbicacionYDireccion NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Plantas (Nombre, Descripcion, UbicacionYDireccion, Estado)
    VALUES (@Nombre, @Descripcion, @UbicacionYDireccion, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdPlanta; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todas las plantas activas
-- =============================================
CREATE PROCEDURE sp_ObtenerPlantas
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdPlanta, Nombre, Descripcion, UbicacionYDireccion, Estado
    FROM Plantas
    WHERE Estado = 1; -- Solo plantas activas
END;

-- =============================================
-- Obtener una planta por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerPlantaPorId
    @IdPlanta INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdPlanta, Nombre, Descripcion, UbicacionYDireccion, Estado
    FROM Plantas
    WHERE IdPlanta = @IdPlanta;
END;

-- =============================================
-- Actualizar una planta por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarPlanta
    @IdPlanta INT,
    @Nombre NVARCHAR(255),
    @Descripcion NVARCHAR(500),
    @UbicacionYDireccion NVARCHAR(500),
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Plantas
    SET Nombre = @Nombre,
        Descripcion = @Descripcion,
        UbicacionYDireccion = @UbicacionYDireccion,
        Estado = @Estado
    WHERE IdPlanta = @IdPlanta;
END;

-- =============================================
-- Eliminar una planta de forma lógica (desactivarla)
-- =============================================
CREATE PROCEDURE sp_EliminarPlanta
    @IdPlanta INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Plantas
    SET Estado = 0
    WHERE IdPlanta = @IdPlanta;
END;
