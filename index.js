var clone = require('clone')
var inspect = require('util').inspect
var log = console.log.bind(console)
var instrumitter = require('instrumitter')
var logEvents = instrumitter(console).watch('log').on('log:invoke', fn => {
    try { fn.arguments = clone(fn.arguments) } catch(e) {}
})

module.exports = pnark => {
    pnark.addReporter('logs', logReporter)
}

var logReporter = report => {
    report.title('console.log')
    report.collect(logEvents, 'log', { stack:true }).then(logs => {
        logs.forEach(log => {
            var call = log.stack[0]
            var preview = log.arguments.map(a => typeof a === 'string' ? a : inspect(a)).join(' ')

            if(preview.length > 30) {
                preview = preview.slice(0, 30)+'&hellip;'
            }
            report.html('<details><summary>')
            report.html('<strong>'+preview+'</strong>')
            report.html('<small> from <em>'+call.file+':'+call.line+'</em> <strong>+'+log.time.toFixed(2)+'ms</strong></small>')
            report.html('</summary>')
            log.arguments.forEach(data => report.markdown('```js\n'+inspect(data)+'\n```'))
            report.html('</details><br/>')

        })

        if(!logs.length) {
            report.section('No console.logs')
        }

        report.end()
    })
}