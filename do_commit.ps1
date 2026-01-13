[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

try {
    Set-Location 'C:\Users\Luiz Eduardo\Documents\GitHub\ghostfolio'
    
    # Configurar git
    & git config --global core.editor ''
    & git config --global core.commentchar '`'
    
    # Ver status
    Write-Host "=== GIT STATUS ===" -ForegroundColor Green
    & git status -s
    
    # Fazer commit
    Write-Host "`n=== FAZENDO COMMIT ===" -ForegroundColor Green
    & git commit -m "feat: refatoracao allocations com services e processors

- Extrai AllocationsDataTransformerService
- Cria processors (geographic, sector, symbol, top-holdings, markets)
- Adiciona AllocationsStateManager
- Cria interfaces de tipos
- Extrai value-formatter"
    
    # Ver log
    Write-Host "`n=== LAST COMMITS ===" -ForegroundColor Green
    & git log --oneline -3
    
    # Push
    Write-Host "`n=== FAZENDO PUSH ===" -ForegroundColor Green
    & git push origin refatoracao-eduardo
    
}
catch {
    Write-Host "ERRO: $_" -ForegroundColor Red
}
