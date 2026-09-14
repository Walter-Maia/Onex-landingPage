param([Parameter(Mandatory=$true)][string]$Source, [Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$sourceRoot = [IO.Path]::GetFullPath($Source).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$archive = [IO.Compression.ZipFile]::Open($Destination, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($sourceFile in [IO.Directory]::EnumerateFiles($sourceRoot, '*', [IO.SearchOption]::AllDirectories)) {
    if (-not $sourceFile.StartsWith($sourceRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'File outside package root' }
    $entryName = $sourceFile.Substring($sourceRoot.Length).Replace('\', '/')
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $sourceFile, $entryName, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $archive.Dispose()
}
