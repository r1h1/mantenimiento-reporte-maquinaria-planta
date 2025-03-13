-- =============================================
-- Crear un nuevo usuario
-- =============================================
CREATE PROCEDURE sp_CrearUsuario
    @NombreCompleto NVARCHAR(255),
    @TelefonoPersonal VARCHAR(20) = NULL,
    @TelefonoCorporativo VARCHAR(20) = NULL,
    @Direccion NVARCHAR(255) = NULL,
    @CorreoElectronico NVARCHAR(255),
    @IdArea INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Usuarios (NombreCompleto, TelefonoPersonal, TelefonoCorporativo, Direccion, CorreoElectronico, IdArea, Estado)
    VALUES (@NombreCompleto, @TelefonoPersonal, @TelefonoCorporativo, @Direccion, @CorreoElectronico, @IdArea, 1);

    SELECT SCOPE_IDENTITY() AS NuevoIdUsuario; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todos los usuarios activos
-- =============================================
CREATE PROCEDURE sp_ObtenerUsuarios
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdUsuario, NombreCompleto, TelefonoPersonal, TelefonoCorporativo, Direccion, CorreoElectronico, IdArea, Estado
    FROM Usuarios
    WHERE Estado = 1; -- Solo usuarios activos
END;

-- =============================================
-- Obtener un usuario por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerUsuarioPorId
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdUsuario, NombreCompleto, TelefonoPersonal, TelefonoCorporativo, Direccion, CorreoElectronico, IdArea, Estado
    FROM Usuarios
    WHERE IdUsuario = @IdUsuario;
END;

-- =============================================
-- Actualizar un usuario por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarUsuario
    @IdUsuario INT,
    @NombreCompleto NVARCHAR(255),
    @TelefonoPersonal VARCHAR(20) = NULL,
    @TelefonoCorporativo VARCHAR(20) = NULL,
    @Direccion NVARCHAR(255) = NULL,
    @CorreoElectronico NVARCHAR(255),
    @IdArea INT = NULL,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Usuarios
    SET NombreCompleto = @NombreCompleto,
        TelefonoPersonal = @TelefonoPersonal,
        TelefonoCorporativo = @TelefonoCorporativo,
        Direccion = @Direccion,
        CorreoElectronico = @CorreoElectronico,
        IdArea = @IdArea,
        Estado = @Estado
    WHERE IdUsuario = @IdUsuario;
END;

-- =============================================
-- Eliminar un usuario de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarUsuario
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Usuarios
    SET Estado = 0
    WHERE IdUsuario = @IdUsuario;
END;
