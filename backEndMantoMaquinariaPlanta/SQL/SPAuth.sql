-- =============================================
-- Crear un nuevo registro de autenticación (contraseña hasheada en el backend con bcrypt)
-- =============================================
CREATE PROCEDURE sp_CrearAuth
    @Usuario NVARCHAR(500),
    @ClaveHasheada NVARCHAR(500), -- Ya viene hasheada desde el backend con bcrypt
    @IdRol INT,
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auth (Usuario, Clave, FechaCreacion, IdRol, IdUsuario, Estado)
    VALUES (@Usuario, @ClaveHasheada, GETDATE(), @IdRol, @IdUsuario, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdAuth; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todas las cuentas de autenticación activas
-- =============================================
CREATE PROCEDURE sp_ObtenerAuth
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdAuth, Usuario, FechaCreacion, IdRol, IdUsuario, Estado
    FROM Auth
    WHERE Estado = 1; -- Solo cuentas activas
END;

-- =============================================
-- Obtener un registro de autenticación por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerAuthPorId
    @IdAuth INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdAuth, Usuario, Clave, FechaCreacion, IdRol, IdUsuario, Estado
    FROM Auth
    WHERE IdAuth = @IdAuth;
END;

-- =============================================
-- Validar credenciales de usuario (se maneja en el backend con bcrypt)
-- =============================================
-- ⚠️ NO se almacena ni compara contraseñas en SQL Server.
-- ⚠️ La validación debe realizarse en el backend comparando el hash almacenado con bcrypt.

CREATE PROCEDURE sp_ObtenerClavePorUsuario
    @Usuario NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Usuario, Clave, IdRol, IdUsuario
    FROM Auth
    WHERE Usuario = @Usuario AND Estado = 1;
END;

-- =============================================
-- Actualizar información de autenticación por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarAuth
    @IdAuth INT,
    @Usuario NVARCHAR(500),
    @ClaveHasheada NVARCHAR(500) = NULL, -- La clave ya debe venir hasheada con bcrypt si se cambia
    @IdRol INT,
    @IdUsuario INT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @ClaveHasheada IS NOT NULL
    BEGIN
        UPDATE Auth
        SET Usuario = @Usuario,
            Clave = @ClaveHasheada,
            IdRol = @IdRol,
            IdUsuario = @IdUsuario,
            Estado = @Estado
        WHERE IdAuth = @IdAuth;
    END
    ELSE
    BEGIN
        UPDATE Auth
        SET Usuario = @Usuario,
            IdRol = @IdRol,
            IdUsuario = @IdUsuario,
            Estado = @Estado
        WHERE IdAuth = @IdAuth;
    END;

    SELECT @@ROWCOUNT AS FilasAfectadas;
END;

-- =============================================
-- Eliminar un registro de autenticación de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarAuth
    @IdAuth INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Auth
    SET Estado = 0
    WHERE IdAuth = @IdAuth;

    SELECT @@ROWCOUNT AS FilasAfectadas;
END;