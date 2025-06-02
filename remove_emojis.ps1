# Script para remover todos os emojis
$files = Get-ChildItem -Recurse -Include "*.js", "*.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content

    # Substituições específicas
    $content = $content -replace '✓', '[OK]'
    $content = $content -replace '✗', '[ERRO]'
    $content = $content -replace '❌', '[ERRO]'
    $content = $content -replace '✅', '[SUCESSO]'
    $content = $content -replace '🔄', '[PROCESSING]'
    $content = $content -replace '🧹', '[CLEANUP]'
    $content = $content -replace '📋', '[COPY]'
    $content = $content -replace '🔍', '[DEBUG]'

    # Regex para remover qualquer emoji Unicode restante
    $content = $content -replace '[\u{1F600}-\u{1F64F}]', ''
    $content = $content -replace '[\u{1F300}-\u{1F5FF}]', ''
    $content = $content -replace '[\u{1F680}-\u{1F6FF}]', ''
    $content = $content -replace '[\u{1F1E0}-\u{1F1FF}]', ''
    $content = $content -replace '[\u{2600}-\u{26FF}]', ''
    $content = $content -replace '[\u{2700}-\u{27BF}]', ''

    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Emoji removal complete!"
