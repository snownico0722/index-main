$ErrorActionPreference = 'Stop'
# Parse without starting the server or touching any real browser profile.
foreach ($file in @('book2html/book2html-server.ps1', 'scripts/export-chrome-bookmarks.ps1')) {
  $tokens = $null; $errors = $null
  $ast = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path $PWD $file), [ref]$tokens, [ref]$errors)
  if ($errors.Count) { throw ($errors | Out-String) }
  $function = $ast.Find({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Get-BookmarkIcon' }, $true)
  . ([scriptblock]::Create($function.Extent.Text))
  $script:ResourcePrefix = 'data/'
  $UseRemoteFavicons = $true
  $params = @{Url='https://alice:private@example.com/secret/path?token=private#private'}
  if ($file.StartsWith('book2html/')) { $params.UseRemoteFavicons = $true }
  $icon = Get-BookmarkIcon @params
  if ($icon -ne 'https://www.google.com/s2/favicons?sz=64&domain=example.com') { throw "Favicon disclosure: $icon" }
  foreach ($url in @('javascript:alert(1)', 'file:///private/profile', 'not a URL')) {
    $params.Url = $url
    if ((Get-BookmarkIcon @params) -match '^https:') { throw "Invalid URL sent to provider: $url" }
  }
  $UseRemoteFavicons = $false
  if ($params.ContainsKey('UseRemoteFavicons')) { $params.UseRemoteFavicons = $false }
  $params.Url = 'https://example.com/private'
  if ((Get-BookmarkIcon @params) -notmatch 'images/favicon.ico$') { throw 'Local fallback failed' }
  Write-Output "PASS favicon privacy and parser: $file"
}
# Generate a synthetic standalone export using the actual production functions.
$serverAst = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path $PWD 'book2html/book2html-server.ps1'), [ref]$tokens, [ref]$errors)
foreach ($statement in $serverAst.EndBlock.Statements) {
  if ($statement -is [System.Management.Automation.Language.FunctionDefinitionAst]) {
    . ([scriptblock]::Create($statement.Extent.Text))
  }
}
$script:ResourcePrefix = '../book2html/data/'
$items = @(1..160 | ForEach-Object {
  [pscustomobject]@{name="收藏 $_ <安全测试>"; url="https://example.com/page/$_"; description='可读性与长页面回归测试'}
})
$folder = [pscustomobject]@{name='测试收藏'; path='Synthetic/Only'}
$sections = @([pscustomobject]@{title='合成书签';items=$items})
$count = Write-BookmarksPage -SelectedFolder $folder -Sections $sections -Path (Join-Path $PWD 'test-results/bookmarks-fixture.html') -SnapshotPath '' -UseRemoteFavicons $false
if ($count -ne 160) { throw 'Generated bookmark count is incorrect' }
Write-Output 'PASS standalone bookmark generation (160 synthetic links)'
