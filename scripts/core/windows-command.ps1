param([string]$RequestFile)
$ErrorActionPreference = 'Stop'
$request = [IO.File]::ReadAllText($RequestFile, [Text.UTF8Encoding]::new($false)) | ConvertFrom-Json
$response = @{ schema = 1; nonce = $request.nonce; status = 'unavailable'; reason = 'process-tree-unavailable' }
try {
    Add-Type -TypeDefinition @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

public static class TibicenWindowsJob {
    [StructLayout(LayoutKind.Sequential)]
    struct BasicLimits {
        public long PerProcessUserTimeLimit, PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize, MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public UIntPtr Affinity;
        public uint PriorityClass, SchedulingClass;
    }
    [StructLayout(LayoutKind.Sequential)]
    struct IoCounters {
        public ulong ReadOperationCount, WriteOperationCount, OtherOperationCount;
        public ulong ReadTransferCount, WriteTransferCount, OtherTransferCount;
    }
    [StructLayout(LayoutKind.Sequential)]
    struct ExtendedLimits {
        public BasicLimits BasicLimitInformation;
        public IoCounters IoInfo;
        public UIntPtr ProcessMemoryLimit, JobMemoryLimit, PeakProcessMemoryUsed, PeakJobMemoryUsed;
    }
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    static extern IntPtr CreateJobObject(IntPtr attributes, string name);
    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool SetInformationJobObject(IntPtr job, int infoClass, ref ExtendedLimits info, uint size);
    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport("kernel32.dll")]
    static extern IntPtr GetCurrentProcess();
    [DllImport("kernel32.dll")]
    static extern bool CloseHandle(IntPtr handle);
    static IntPtr ownedJob = IntPtr.Zero;

    public static void Open() {
        // No name or inheritable security attributes: project children cannot retain this handle.
        IntPtr job = CreateJobObject(IntPtr.Zero, null);
        if (job == IntPtr.Zero) throw new InvalidOperationException("Job unavailable");
        var limits = new ExtendedLimits();
        limits.BasicLimitInformation.LimitFlags = 0x2000; // KILL_ON_JOB_CLOSE
        if (!SetInformationJobObject(job, 9, ref limits, (uint)Marshal.SizeOf(typeof(ExtendedLimits))) ||
            !AssignProcessToJobObject(job, GetCurrentProcess())) {
            CloseHandle(job);
            throw new InvalidOperationException("Job unavailable");
        }
        ownedJob = job;
    }

    public static uint Run(string executable, string arguments, string cwd) {
        using (var process = new Process()) {
            process.StartInfo = new ProcessStartInfo {
                FileName = executable, Arguments = arguments, WorkingDirectory = cwd,
                UseShellExecute = false, CreateNoWindow = true
            };
            if (!process.Start()) throw new InvalidOperationException("Command unavailable");
            process.WaitForExit();
            return unchecked((uint)process.ExitCode);
        }
    }

    public static void Close() {
        IntPtr job = ownedJob;
        ownedJob = IntPtr.Zero;
        // This terminates the helper too. The result must already be written.
        if (job != IntPtr.Zero) CloseHandle(job);
    }
}
'@
    [TibicenWindowsJob]::Open()
    $response.reason = 'execution-unavailable'
    $code = [TibicenWindowsJob]::Run([string]$request.executable, [string]$request.arguments, [string]$request.cwd)
    $response = @{ schema = 1; nonce = $request.nonce; status = 'completed'; exitCode = $code }
} catch {
    # Platform/bootstrap errors are not project exit codes or trusted stdout control messages.
} finally {
    try {
        $json = $response | ConvertTo-Json -Compress
        [IO.File]::WriteAllText([string]$request.receipt, $json, (New-Object System.Text.UTF8Encoding($false)))
    } finally {
        if ('TibicenWindowsJob' -as [type]) { [TibicenWindowsJob]::Close() }
    }
}
