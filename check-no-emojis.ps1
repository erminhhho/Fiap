# Script para verificar se há emojis no projeto FIAP
# Execute este script antes de fazer commits para garantir que não há emojis

Write-Host "[CHECK] Verificando presença de emojis no projeto..." -ForegroundColor Yellow
Write-Host ""

$foundEmojis = $false
$fileTypes = @('*.js', '*.html', '*.css', '*.md', '*.txt')

# Lista de emojis comuns para detectar (como strings literais)
$commonEmojis = @(
    'checkmark', 'cross mark', 'fire', 'magnifying glass',
    'memo', 'bar chart', 'test tube', 'floppy disk',
    'globe', 'party popper', 'warning sign', 'rotating light'
)

foreach ($fileType in $fileTypes) {
    $files = Get-ChildItem -Path "." -Filter $fileType -Recurse | Where-Object {
        $_.FullName -notlike "*node_modules*" -and
        $_.FullName -notlike "*.git*" -and
        $_.Name -ne "check-no-emojis.ps1"
    }

    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue

            if ($content) {
                # Verificar se há caracteres não-ASCII que podem ser emojis
                if ($content -match '[^\x00-\x7F]') {
                    # Fazer uma verificação mais específica
                    $lines = $content -split "`n"
                    for ($i = 0; $i -lt $lines.Length; $i++) {
                        $line = $lines[$i]
                        # Detectar possíveis emojis pela presença de caracteres especiais
                        if ($line -match '[\u2600-\u26FF]|[\u2700-\u27BF]|[\uD83C-\uDBFF]') {
                            Write-Host "[ERRO] Possível emoji encontrado em: $($file.FullName) linha $($i+1)" -ForegroundColor Red
                            Write-Host "       Conteúdo: $($line.Trim())" -ForegroundColor Yellow
                            $foundEmojis = $true
                        }
                    }
                }
            }
        }
        catch {
            Write-Host "[WARNING] Erro ao ler arquivo: $($file.FullName)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
if ($foundEmojis) {
    Write-Host "[ERRO] ATENCAO: POSSÍVEIS EMOJIS FORAM ENCONTRADOS NO PROJETO!" -ForegroundColor Red
    Write-Host "[ACTION] Remova todos os emojis antes de fazer commit." -ForegroundColor Red
    Write-Host "[INFO] Consulte o README.md para ver as tags de substituição recomendadas." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "[SUCESSO] PERFEITO! Nenhum emoji detectado no projeto." -ForegroundColor Green
    Write-Host "[OK] O projeto está livre de emojis conforme as diretrizes." -ForegroundColor Green
    exit 0
}
