-- =============================================
-- Crear una nueva área
-- =============================================
CREATE PROCEDURE sp_CrearArea
    @Nombre NVARCHAR(255),
    @Ubicacion NVARCHAR(255) = NULL,
    @IdPlanta INT = NULL,
    @Descripcion NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Areas (Nombre, Ubicacion, IdPlanta, Descripcion, Estado)
    VALUES (@Nombre, @Ubicacion, @IdPlanta, @Descripcion, 1);

    SELECT SCOPE_IDENTITY() AS NuevoIdArea; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todas las áreas activas
-- =============================================
CREATE PROCEDURE sp_ObtenerAreas
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdArea, Nombre, Ubicacion, IdPlanta, Descripcion, Estado
    FROM Areas
    WHERE Estado = 1; -- Solo áreas activas
END;

-- =============================================
-- Obtener un área por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerAreaPorId
    @IdArea INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdArea, Nombre, Ubicacion, IdPlanta, Descripcion, Estado
    FROM Areas
    WHERE IdArea = @IdArea;
END;

-- =============================================
-- Actualizar un área por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarArea
    @IdArea INT,
    @Nombre NVARCHAR(255),
    @Ubicacion NVARCHAR(255) = NULL,
    @IdPlanta INT = NULL,
    @Descripcion NVARCHAR(500),
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Areas
    SET Nombre = @Nombre,
        Ubicacion = @Ubicacion,
        IdPlanta = @IdPlanta,
        Descripcion = @Descripcion,
        Estado = @Estado
    WHERE IdArea = @IdArea;
END;

-- =============================================
-- Eliminar un área de forma lógica (desactivarla)
-- =============================================
CREATE PROCEDURE sp_EliminarArea
    @IdArea INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Areas
    SET Estado = 0
    WHERE IdArea = @IdArea;
END;
