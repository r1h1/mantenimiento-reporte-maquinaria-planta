-- =============================================
-- Crear una nueva máquina
-- =============================================
CREATE PROCEDURE sp_CrearMaquina
    @NombreCodigo NVARCHAR(255),
    @IdTipoMaquina INT,
    @IdArea INT = NULL,
    @IdPlanta INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Maquinas (NombreCodigo, IdTipoMaquina, IdArea, IdPlanta, Estado)
    VALUES (@NombreCodigo, @IdTipoMaquina, @IdArea, @IdPlanta, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdMaquina; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todas las máquinas activas
-- =============================================
CREATE PROCEDURE sp_ObtenerMaquinas
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdMaquina, NombreCodigo, IdTipoMaquina, IdArea, IdPlanta, Estado
    FROM Maquinas
    WHERE Estado = 1; -- Solo máquinas activas
END;

-- =============================================
-- Obtener una máquina por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerMaquinaPorId
    @IdMaquina INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdMaquina, NombreCodigo, IdTipoMaquina, IdArea, IdPlanta, Estado
    FROM Maquinas
    WHERE IdMaquina = @IdMaquina;
END;

-- =============================================
-- Actualizar una máquina por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarMaquina
    @IdMaquina INT,
    @NombreCodigo NVARCHAR(255),
    @IdTipoMaquina INT,
    @IdArea INT = NULL,
    @IdPlanta INT = NULL,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Maquinas
    SET NombreCodigo = @NombreCodigo,
        IdTipoMaquina = @IdTipoMaquina,
        IdArea = @IdArea,
        IdPlanta = @IdPlanta,
        Estado = @Estado
    WHERE IdMaquina = @IdMaquina;
END;

-- =============================================
-- Eliminar una máquina de forma lógica (desactivarla)
-- =============================================
CREATE PROCEDURE sp_EliminarMaquina
    @IdMaquina INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Maquinas
    SET Estado = 0
    WHERE IdMaquina = @IdMaquina;
END;
